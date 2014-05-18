var extended = require("./extended"),
    isUndefined = extended.isUndefined,
    util = require("util"),
    out = process.stdout,
    stream = require("stream"),
    EMPTY = /^\s*(?:''|"")?\s*(?:,\s*(?:''|"")?\s*)*$/,
    DEFAULT_DELIMITER = ",",
    createParser = require("./parser");

function spreadArgs(f, args, scope) {
    var ret;
    switch ((args || []).length) {
        case 0:
            ret = f.call(scope);
            break;
        case 1:
            ret = f.call(scope, args[0]);
            break;
        case 2:
            ret = f.call(scope, args[0], args[1]);
            break;
        case 3:
            ret = f.call(scope, args[0], args[1], args[2]);
            break;
        default:
            ret = f.apply(scope, args);
    }
    return ret;
}


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
    this.__objectMode = options.objectMode;
    this.__buffered = [];
    return this;
}

util.inherits(ParserStream, stream.Transform);

var origOn = ParserStream.prototype.on,
    origPause = ParserStream.prototype.pause,
    origResume = ParserStream.prototype.resume,
    origEmit = ParserStream.prototype.emit;

function pause() {
    spreadArgs(origPause, arguments, this);
    this.paused = true;
    this.pause = pause;
}

function resume() {
    spreadArgs(origResume, arguments, this);
    this.paused = false;
    if (this.__pausedDone) {
        this.__pausedDone();
    }
    this.resume = resume;
}

extended(ParserStream).extend({

    __pausedDone: null,

    __endEmitted: false,

    __emittedData: false,

    __handleLine: function __parseLineData(line, index, ignore) {
        var ignoreEmpty = this._ignoreEmpty;
        if (extended.isBoolean(ignoreEmpty) && ignoreEmpty && (!line || EMPTY.test(line.join("")))) {
            return null;
        }
        if (!ignore) {
            line = this.__transform(line, index);
            if (this.__validate(line, index)) {
                return line;
            } else {
                this.emit("data-invalid", line, index);
            }
        } else {
            return line;
        }
    },

    _parse: function _parseLine(data, hasMoreData) {
        var row, count, ret, rows, self = this;
        try {
            data = this.parser(data, hasMoreData);
            ret = data.line;
            rows = data.rows;
            if (!this._parsedHeaders) {
                var headers = this._headers;
                if (extended.isBoolean(headers) && headers) {
                    headers = this.__handleLine(rows.shift(), 0, true);
                }
                if (extended.isArray(headers)) {
                    var headersLength = headers.length,
                        orig = this.__transform.bind(this);
                    this.__transform = function (data, index) {
                        var ret = {}, i = -1, val;
                        if (data.length > headersLength) {
                            self.emit("error", new Error("Unexpected Error: column header mismatch expected: " + headersLength + " columns got: " + data.length));
                        }
                        while (++i < headersLength) {
                            val = data[i];
                            ret[headers[i]] = isUndefined(val) ? '' : val;
                        }
                        return orig(ret, index);
                    };
                }
                this._parsedHeaders = true;
            }
            for (var i = 0, l = rows.length; i < l; i++) {
                row = rows[i];
                if (row) {
                    var dataRow = this.__handleLine(row, (count = ++this._rowCount));
                    if (dataRow) {
                        if (!this.paused) {
                            this.__emitRecord(dataRow, count);
                        } else {
                            this.__buffered.push([dataRow, count]);
                        }
                    } else {
                        count = --this._rowCount;
                    }
                }
            }
        } catch (e) {
            this.emit("error", e);
        }
        return ret;
    },

    __emitRecord: function (dataRow, count) {
        this.emit("record", dataRow, count);
        if (this._emitData) {
            this.push(this.__objectMode ? dataRow : JSON.stringify(dataRow));
        }
    },

    _transform: function (data, encoding, done) {
        var lines = this.lines;
        var lineData = (lines + data);
        if (lineData.length > 1) {
            lineData = this._parse(lineData, true);
        }
        this.lines = lineData;
        if (!this.paused) {
            done();
        } else {
            this.__pausedDone = done;
        }
    },

    _flush: function (callback) {
        if (this.lines) {
            this._parse(this.lines, false);
        }
        //increment row count so we aren't 0 based
        this.emit("end");
        callback();
    },

    __validate: function (data, index) {
        return true;
    },
    __transform: function (data, index) {
        return data;
    },

    pause: function () {
        if (!this.paused) {
            this.paused = true;
            this.emit("pause");
        }
    },

    emit: function (event) {
        if (event === "end") {
            if (!this.__endEmitted) {
                this.__endEmitted = true;
                spreadArgs(origEmit, ["end", ++this._rowCount], this);
            }
        } else {
            spreadArgs(origEmit, arguments, this);
        }
    },

    resume: function () {
        if (this.paused) {
            this.paused = false;
            var buffered = this.__buffered, l = buffered.length;
            if (l) {
                var entry;
                while (buffered.length) {
                    entry = buffered.shift();
                    this.__emitRecord(entry[0], entry[1]);
                    //handle case where paused is called while emitting data
                    if (this.paused) {
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
            this.emit("resume");
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
            throw new TypeError("fast-csv.Parser#validate requires a function");
        }
        this.__validate = cb;
        return this;
    },
    transform: function (cb) {
        if (!extended.isFunction(cb)) {
            throw new TypeError("fast-csv.Parser#transform requires a function");
        }
        this.__transform = cb;
        return this;
    }

});

module.exports = ParserStream;