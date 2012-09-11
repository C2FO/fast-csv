var fs = require("fs"),
    comb = require("comb"),
    EventEmitter = require("events").EventEmitter,
    Promise = comb.Promise,
    util = require("util"),
    out = process.stdout,
    Stream = require("stream").Stream;


var VALIDATE = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
var VALUE = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

var Parser = comb(function Parser(options) {
    EventEmitter.call(this);
    this._parsedHeaders = false;
    this._rowCount = 0;
    options = options || {};
    this._headers = options.headers;
});
util.inherits(Parser, EventEmitter);

Parser.extend({
    __parseLine:function __parseLineData(data, index, ignore) {
        // Return NULL if input string is not well formed CSV string.
        if (!VALIDATE.test(data)) {
            this.emit("error", new Error("Invalid row " + data));
        }
        var a = [];
        data.replace(VALUE, function lineReplace(m0, m1, m2, m3) {
            var item;
            if (m1 !== undefined) {
                item = m1.replace(/\\'/g, "'");
            } else if (m2 !== undefined) {
                item = m2.replace(/\\"/g, '"');
            } else if (m3 !== undefined) {
                item = m3;
            }
            a.push(item);
            return ''; // Return empty string.
        }.bind(this));
        // Handle special case of empty last value.
        if (/,\s*$/.test(data)) {
            a.push('');
        }
        if (!ignore) {
            a = this._transform(a, index);
            if (this._validate(a, index)) {
                return a;
            } else {
                this.emit("data-invalid", a, index);
            }
        } else {
            return a;
        }
    },

    _parse:function _parseLine(data) {
        var row, parseLine = this.__parseLine.bind(this), emitRow = this.emit.bind(this, "data");
        if (!this._parsedHeaders) {
            var headers = this._headers;
            if (comb.isBoolean(headers) && headers) {
                headers = parseLine(data.shift(), 0, true);
            }
            if (comb.isArray(headers)) {
                var headersLength = headers.length,
                    orig = this._transform.bind(this);
                this._transform = function (data, index) {
                    var ret = {};
                    for (var i = 0; i < headersLength; i++) {
                        ret[headers[i]] = data[i];
                    }
                    return orig(ret, index);
                };
            }
            this._parsedHeaders = true;
        }
        for (var i = 0, l = data.length; i < l; i++) {
            row = data[i];
            if (row) {
                var count = this._rowCount++;
                var dataRow = parseLine(row, count);
                if (dataRow) {
                    emitRow(dataRow, count);
                }
            }
        }
    },
    from:function _from(from) {
        this.__from = from;
        return this;
    },
    parse:function _parse(from) {
        from = from || this.__from;
        if (comb.isString(from)) {
            from = fs.createReadStream(from);
            from.on("end", function () {
                from.destroy();
            });
        }
        if (comb.isObject(from) && from instanceof Stream) {
            var lines = "", parse = this._parse.bind(this), end = this.emit.bind(this, "end");
            from.on("data", function streamOnData(data) {
                var lineData = (lines + data).trim().split("\n");
                if (lineData.length > 1) {
                    lines = lineData.pop();
                    parse(lineData);
                } else {
                    lines += data;
                }
            });
            from.on("end", function streamOnEnd() {
                parse(lines.split("\n"));
                end();
            });
        } else {
            throw new TypeError("fast-csv.Parser#parse from must be a path or ReadableStream");
        }
        return this;
    },

    _validate:function (data, index) {
        return true;
    },
    _transform:function (data, index) {
        return data;
    },
    validate:function (cb) {
        if (!comb.isFunction(cb)) {
            throw new TypeError("fast-csv.Parser#validate requires a function");
        }
        this._validate = cb;
        return this;
    },
    transform:function (cb) {
        if (!comb.isFunction(cb)) {
            throw new TypeError("fast-csv.Parser#transform requires a function");
        }
        this._transform = cb;
        return this;
    }
});

process.on("uncaughtException", function (e) {
    console.log(e.stack);
});

/**
 * Invoke to parse a csv file.
 *
 * To parse a file.
 * ```
 * var csv = require("fast-csv");
 *
 *
 * ```
 *
 * @name fast-csv
 * @param location
 * @param options
 * @return {*}
 */
module.exports = function parse(location, options) {
    return new Parser(options).from(location);
};
