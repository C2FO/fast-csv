/**
 * @projectName fast-csv
 * @github https://github.com/C2FO/fast-csv
 * @includeDoc [Test Coverage] [../docs-md/coverage.html]
 * @header
 *
 * [![build status](https://secure.travis-ci.org/C2FO/fast-csv.png)](http://travis-ci.org/C2FO/fast-csv)
 * # Fast-csv
 *
 * This is a library is aimed at providing fast CSV parsing. It accomplishes this by not handling some of the more complex
 * edge cases such as multi line rows. However it does support escaped values, embedded commas, double and single quotes.
 *
 * ## Installation
 *
 * `npm install fast-csv`
 *
 * ## Usage
 *
 * To parse a file.
 *
 * ```javascript
 * var csv = require("fast-csv");
 *
 * csv("my.csv")
 *  .on("data", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  })
 *  .parse();
 * ```
 *
 * You may also parse a stream.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv(stream)
 *  .on("data", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  })
 *  .parse();
 *
 * ```
 *
 * If you expect the first line your csv to headers you may pass a headers option in. Setting the headers option will
 * cause change each row to an object rather than an array.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv(stream, {headers : true})
 *  .on("data", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  })
 *  .parse();
 *
 * ```
 *
 * You may alternatively pass an array of header names which must match the order of each column in the csv, otherwise
 * the data columns will not match.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv(stream, {headers : ["firstName", "lastName", "address"]})
 *  .on("data", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  })
 *  .parse();
 *
 * ```
 *
 * If your data may include empty rows, the sort Excel might include at the end of the file for instance, you can ignore
 * these by including the `ignoreEmpty` option.
 *
 * Any rows consisting of nothing but empty strings and/or commas will be skipped, without emitting a 'data' or 'error' event.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv(stream, {ignoreEmpty: true})
 *  .on("data", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  })
 *  .parse();
 *
 * ```
 *
 * ### Validating
 *
 * You can validate each row in the csv by providing a validate handler. If a row is invalid then a `data-invalid` event
 * will be emitted with the row and the index.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv(stream, {headers : true})
 *  .validate(function(data){
 *      return data.age < 50; //all persons must be under the age of 50
 *  })
 *  .on("data-invalid", function(data){
 *      //do something with invalid row
 *  })
 *  .on("data", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  })
 *  .parse();
 *
 * ```
 *
 * ### Transforming
 *
 * You can transform data by providing in a transform function. What is returned from the transform function will
 * be provided to validate and emitted as a row.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv(stream)
 *  .transform(function(data){
 *      return data.reverse(); //reverse each row.
 *  })
 *  .on("data", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  })
 *  .parse();
 *
 * ```
 * @footer
 * ## License
 *
 * MIT <https://github.com/C2FO/fast-csv/raw/master/LICENSE>
 *
 * ##Meta
 * * Code: `git clone git://github.com/C2FO/fast-csv.git`
 * * Website: <http://c2fo.com>
 * * Twitter: [http://twitter.com/c2fo](http://twitter.com/c2fo) - 877.465.4045
 */

var fs = require("fs"),
    _ = require("extended")().register(require("is-extended")).register(require("object-extended")),
    EventEmitter = require("events").EventEmitter,
    util = require("util"),
    out = process.stdout,
    Stream = require("stream").Stream;


var VALIDATE = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
var EMPTY = /^\s*(?:''|"")?\s*(?:,\s*(?:''|"")?\s*)*$/;
var VALUE = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
var LINE_SPLIT = /[\r\n|\r|\n]/;

function Parser(options) {
    EventEmitter.call(this);
    this._parsedHeaders = false;
    this._rowCount = 0;
    options = options || {};
    this._headers = options.headers;
    this._ignoreEmpty = options.ignoreEmpty;
}
util.inherits(Parser, EventEmitter);

_(Parser).extend({
    __parseLine: function __parseLineData(data, index, ignore) {
        // Return NULL if input string is not well formed CSV string.
        //regexp based on http://stackoverflow.com/a/8497474
        var ignoreEmpty = this._ignoreEmpty;
        if (!VALIDATE.test(data)) {
            this.emit("error", new Error("Invalid row " + data));
            return null;
        } else if (_.isBoolean(ignoreEmpty) && ignoreEmpty && EMPTY.test(data)) {
            return null;
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

    _parse: function _parseLine(data) {
        var row, parseLine = this.__parseLine.bind(this), emitRow = this.emit.bind(this, "data"), count = 0;
        if (!this._parsedHeaders) {
            var headers = this._headers;
            if (_.isBoolean(headers) && headers) {
                headers = parseLine(data.shift(), 0, true);
            }
            if (_.isArray(headers)) {
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
                var dataRow = parseLine(row, count);
                if (dataRow) {
                    count = this._rowCount++;
                    emitRow(dataRow, count);
                }
            }
        }
    },
    from: function _from(from) {
        this.__from = from;
        return this;
    },
    parse: function _parse(from) {
        from = from || this.__from;
        if (_.isString(from)) {
            from = fs.createReadStream(from);
            from.on("end", function () {
                from.destroy();
            });
        }
        if (_.isObject(from) && from instanceof Stream) {
            var lines = "", parse = this._parse.bind(this), end = this.emit.bind(this, "end");
            from.on("data", function streamOnData(data) {
                var lineData = (lines + data).trim().split(LINE_SPLIT);
                if (lineData.length > 1) {
                    lines = lineData.pop();
                    parse(lineData);
                } else {
                    lines += data;
                }
            });
            from.on("end", function streamOnEnd() {
                parse(lines.split(LINE_SPLIT));
                end(this._rowCount);
            }.bind(this));
        } else {
            throw new TypeError("fast-csv.Parser#parse from must be a path or ReadableStream");
        }
        return this;
    },

    _validate: function (data, index) {
        return true;
    },
    _transform: function (data, index) {
        return data;
    },
    validate: function (cb) {
        if (!_.isFunction(cb)) {
            throw new TypeError("fast-csv.Parser#validate requires a function");
        }
        this._validate = cb;
        return this;
    },
    transform: function (cb) {
        if (!_.isFunction(cb)) {
            throw new TypeError("fast-csv.Parser#transform requires a function");
        }
        this._transform = cb;
        return this;
    }
});

/**
 * Entry point to `fast-csv`. `fast-csv` does not store rows its proccesses each row and emits it. If you wish to save
 * every row into an array you must store them yourself by using the `data` event. Once all rows are done processing
 * the `end` event is emitted.
 *
 * Invoke to parse a csv file.
 *
 * @name fast-csv
 * @param location
 * @param options
 * @return {*}
 */
module.exports = function parse(location, options) {
    return new Parser(options).from(location);
};
