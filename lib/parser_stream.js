var extended = require("./extended"),
    isUndefined = extended.isUndefined,
    EventEmitter = require("events").EventEmitter,
    util = require("util"),
    out = process.stdout,
    stream = require("stream"),
    EMPTY = /^\s*(?:''|"")?\s*(?:,\s*(?:''|"")?\s*)*$/,
    VALUE = /([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)/,
    LINE_SPLIT = /[\r\n]+/,
    DEFAULT_DELIMITER = ",",
    createParser = require("./parser");

function ParserStream(options) {
    stream.Transform.call(this, options);
    this.lines = "";
    this._parsedHeaders = false;
    this._rowCount = 0;
    this._emitData = false;
    options = options || {};
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
    this.parser = createParser(delimiter);
    this._headers = options.headers;
    this._ignoreEmpty = options.ignoreEmpty;
    return this;
}

util.inherits(ParserStream, stream.Transform);

var origOn = ParserStream.prototype.on;

extended(ParserStream).extend({

    __parseLine: function __parseLineData(data, index, ignore) {
        var ignoreEmpty = this._ignoreEmpty;
        if (extended.isBoolean(ignoreEmpty) && ignoreEmpty && EMPTY.test(data)) {
            return null;
        }
        var a;
        try {
            a = this.parser(data);
            if (!ignore) {
                a = this.__transform(a, index);
                if (this.__validate(a, index)) {
                    return a;
                } else {
                    this.emit("data-invalid", a, index);
                }
            } else {
                return a;
            }
        } catch (e) {
            this.emit("parse-error", e);
            return null;
        }
    },

    _parse: function _parseLine(data) {
        var row, parseLine = this.__parseLine.bind(this),
            emitRow = this.emit.bind(this, "record"),
            emitData = this._emitData,
            count = 0;
        if (!this._parsedHeaders) {
            var headers = this._headers;
            if (extended.isBoolean(headers) && headers) {
                headers = parseLine(data.shift(), 0, true);
            }
            if (extended.isArray(headers)) {
                var headersLength = headers.length,
                    orig = this.__transform.bind(this);
                this.__transform = function (data, index) {
                    var ret = {}, i = -1, val;
                    while (++i < headersLength) {
                        val = data[i];
                        ret[headers[i]] = isUndefined(val) ? '' : val;
                    }
                    return orig(ret, index);
                };
            }
            this._parsedHeaders = true;
        }
        for (var i = 0, l = data.length; i < l; i++) {
            row = data[i];
            if (row) {
                var dataRow = parseLine(row, count);
                if (dataRow) {
                    emitRow(dataRow, (count = this._rowCount++));
                    if (emitData) {
                        this.push(JSON.stringify(dataRow));
                    }
                }
            }
        }
    },

    _transform: function (data, encoding, done) {
        var lines = this.lines;
        var lineData = (lines + data).split(LINE_SPLIT);
        if (lineData.length > 1) {
            this.lines = lineData.pop();
            this._parse(lineData);
        } else {
            this.lines += data;
        }
        done();
    },

    _flush: function (callback) {
        this._parse(this.lines.split(LINE_SPLIT));
        this.emit("end", this._rowCount);
        callback();
    },

    __validate: function (data, index) {
        return true;
    },
    __transform: function (data, index) {
        return data;
    },

    on: function (evt) {
        if (evt === "data" || evt === "readable") {
            this._emitData = true;
        }
        origOn.apply(this, arguments);
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