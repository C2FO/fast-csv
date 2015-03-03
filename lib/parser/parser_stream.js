var extended = require("../extended"),
    isUndefined = extended.isUndefined,
    spreadArgs = extended.spreadArgs,
    util = require("util"),
    out = process.stdout,
    stream = require("stream"),
    EMPTY = /^\s*(?:''|"")?\s*(?:,\s*(?:''|"")?\s*)*$/,
    DEFAULT_DELIMITER = ",",
    createParser = require("./parser"),
    fs = require("fs"),
    hasIsPaused = !!stream.Transform.prototype.isPaused;

function ParserStream(options) {
    options = options || {};
    options.objectMode = extended.has(options, "objectMode") ? options.objectMode : true;
    stream.Transform.call(this, options);
    this.lines = "";
    this._parsedHeaders = false;
    this._rowCount = -1;
    this._emitData = false;
    var delimiter;
    if (extended.has(options, "delimiter")) {
        delimiter = options.delimiter;
        if (delimiter.length > 1) {
            throw new Error("delimiter option must be one character long");
        }
        delimiter = extended.escape(delimiter);
    } else {
        delimiter = DEFAULT_DELIMITER;
    }
    options.delimiter = delimiter;
    this.parser = createParser(options);
    this._headers = options.headers;
    this._ignoreEmpty = options.ignoreEmpty;
    this._discardUnmappedColumns = options.discardUnmappedColumns;
    this._strictColumnHandling = options.strictColumnHandling;
    this.__objectMode = options.objectMode;
    this.__buffered = [];
    return this;
}

util.inherits(ParserStream, stream.Transform);

var origOn = ParserStream.prototype.on,
    origEmit = ParserStream.prototype.emit;


extended(ParserStream).extend({

    __pausedDone: null,

    __endEmitted: false,

    __emittedData: false,

    __handleLine: function __parseLineData(line, index, ignore, next) {
        var ignoreEmpty = this._ignoreEmpty, self = this;
        if (extended.isBoolean(ignoreEmpty) && ignoreEmpty && (!line || EMPTY.test(line.join("")))) {
            return next(null, null);
        }
        if (!ignore) {
            this.__transform(line, function (err, line) {
                if (err) {
                    next(err);
                } else {
                    self.__validate(line, function (err, isValid) {
                        if (err) {
                            next(err);
                        } else if (isValid) {
                            next(null, line);
                        } else {
                            self.emit("data-invalid", line, index);
                            next(null, null);
                        }
                    });
                }
            });
        } else {
            return next(null, line);
        }
    },

    __processRows: function (rows, data, cb) {
        var self = this, count;
        extended.asyncEach(rows, function (row, cb) {
            if (row) {
                self.__handleLine(row, (count = ++self._rowCount), false, function (err, dataRow) {
                    if (err) {
                        cb(err);
                    } else {
                        if (dataRow) {
                            if (!self.isStreamPaused()) {
                                self.__emitRecord(dataRow, count);
                            } else {
                                self.__buffered.push([dataRow, count]);
                            }
                        } else {
                            count = --self._rowCount;
                        }
                        cb();
                    }
                });
            }
        }, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null, data.line);
            }
        });
    },

    __processHeaders: function (rows, cb) {
        var headers = this._headers,
            discardUnmappedColumns = this._discardUnmappedColumns,
            strictColumnHandling = this._strictColumnHandling,
            self = this;

        function headerHandler(err, headers) {
            if (err) {
                cb(err);
            } else if (extended.isArray(headers)) {
                var headersLength = headers.length,
                    orig = self.__transform;
                self.__transform = function (data, cb) {
                    var ret = {}, i = -1, val;
                    if (data.length > headersLength) {
                        if (discardUnmappedColumns) {
                            data.splice(headersLength);
                        } else if (strictColumnHandling) {
                            self.emit("data-invalid", data);
                            return orig(null, cb);
                        } else {
                            self.emit("error", new Error("Unexpected Error: column header mismatch expected: " + headersLength + " columns got: " + data.length));
                            return orig(null, cb);
                        }
                    } else if (strictColumnHandling && (data.length < headersLength)) {
                        self.emit("data-invalid", data);
                        return orig(null, cb);
                    }
                    while (++i < headersLength) {
                        val = data[i];
                        ret[headers[i]] = isUndefined(val) ? '' : val;
                    }
                    
                    return orig(ret, cb);
                };
            }
            self._parsedHeaders = true;
            cb(null);
        }

        if (extended.isBoolean(headers) && headers) {
            this.__handleLine(rows.shift(), 0, true, headerHandler);
        } else {
            headerHandler(null, headers);
        }

    },

    _parse: function _parseLine(data, hasMoreData, cb) {
        var rows, self = this;
        try {
            data = this.parser(data, hasMoreData);
            rows = data.rows;
            if (rows.length) {
                if (!this._parsedHeaders) {
                    this.__processHeaders(rows, function (err) {
                        if (err) {
                            cb(err);
                        } else {
                            self.__processRows(rows, data, cb);
                        }
                    });
                } else {
                    this.__processRows(rows, data, cb);
                }
            } else {
                cb(null, data.line);
            }
        } catch (e) {
            cb(e);
        }
    },

    __emitRecord: function (dataRow, count) {
        this.emit("record", dataRow, count);
        if (this._emitData) {
            this.push(this.__objectMode ? dataRow : JSON.stringify(dataRow));
        }
    },

    _transform: function (data, encoding, done) {
        var lines = this.lines,
            lineData = (lines + data),
            self = this;
        if (lineData.length > 1) {
            this._parse(lineData, true, function (err, lineData) {
                if (err) {
                    done(err);
                } else {
                    self.lines = lineData;
                    if (!self.isStreamPaused()) {
                        done();
                    } else {
                        self.__pausedDone = done;
                    }
                }
            });
        } else {
            this.lines = lineData;
            if (!this.isStreamPaused()) {
                done();
            } else {
                this.__pausedDone = done;
            }
        }

    },

    __doFlush: function (callback) {
        try {
            callback();
        } catch (e) {
            callback(e);
        }
    },

    _flush: function (callback) {
        var self = this;
        if (this.lines) {
            this._parse(this.lines, false, function (err) {
                if (err) {
                    callback(err);
                } else if (!self.isStreamPaused()) {
                    self.__doFlush(callback);
                } else {
                    self.__pausedDone = function () {
                        self.__doFlush(callback);
                    };
                }
            });
        } else {
            if (!this.isStreamPaused()) {
                this.__doFlush(callback);
            } else {
                this.__pausedDone = function () {
                    self.__doFlush(callback);
                };
            }
        }
    },

    __validate: function (data, next) {
        return next(null, true);
    },

    __transform: function (data, next) {
        return next(null, data);
    },

    __flushPausedBuffer: function () {
        var buffered = this.__buffered, l = buffered.length;
        if (l) {
            var entry;
            while (buffered.length) {
                entry = buffered.shift();
                this.__emitRecord(entry[0], entry[1]);
                //handle case where paused is called while emitting data
                if (this.isStreamPaused()) {
                    return;
                }
            }
            buffered.length = 0;
        }
        if (this.__pausedDone) {
            var done = this.__pausedDone;
            this.__pausedDone = null;
            done();
        }
    },

    isStreamPaused: function () {
        return this.__paused;
    },

    emit: function (event) {
        try {
            if (event === "end") {
                if (!this.__endEmitted) {
                    this.__endEmitted = true;
                    spreadArgs(origEmit, ["end", ++this._rowCount], this);
                }
            } else {
                if (!hasIsPaused) {
                    if (event === "pause") {
                        this.__paused = true;
                    } else if (event === "resume") {
                        this.__paused = false;
                        this.__flushPausedBuffer();
                    }
                }
                spreadArgs(origEmit, arguments, this);
            }
        } catch (e) {
            this.emit("error", e);
        }
    },

    on: function (evt) {
        if (evt === "data" || evt === "readable") {
            this._emitData = true;
        }
        spreadArgs(origOn, arguments, this);
        return this;
    },

    validate: function (cb) {
        if (!extended.isFunction(cb)) {
            this.emit("error", new TypeError("fast-csv.Parser#validate requires a function"));
        }
        if (cb.length === 2) {
            this.__validate = cb;
        } else {
            this.__validate = function (data, next) {
                return next(null, cb(data));
            };
        }
        return this;
    },
    transform: function (cb) {
        if (!extended.isFunction(cb)) {
            this.emit("error", new TypeError("fast-csv.Parser#transform requires a function"));
        }
        if (cb.length === 2) {
            this.__transform = cb;
        } else {
            this.__transform = function (data, next) {
                return next(null, cb(data));
            };
        }
        return this;
    }

});

module.exports = ParserStream;