var fs = require("fs"),
    util = require("util"),
    extended = require("./extended"),
    isUndefinedOrNull = extended.isUndefinedOrNull,
    hash = extended.hash,
    stream = require("stream"),
    Transform = stream.Transform,
    LINE_BREAK = extended.LINE_BREAK;

function createFormatter(options) {
    options = options || {};
    var delimiter = options.delimiter || ",",
        ESCAPE_REGEXP = new RegExp("[" + delimiter + "\\r\\n']"),
        QUOTE = options.quote || '"',
        ESCAPE = options.escape || '"',
        REPLACE_REGEXP = new RegExp(QUOTE, "g");

    function escapeField(field) {
        var escape;
        field = field.replace(/\0/g, '');
        if ((escape = field.indexOf(QUOTE) !== -1)) {
            field = field.replace(REPLACE_REGEXP, ESCAPE + QUOTE);
            escape = true;
        } else {
            escape = field.search(ESCAPE_REGEXP) !== -1;
        }
        if (escape) {
            field = ['"' + field + '"'];
        } else {
            field = [field];
        }
        return field.join("");
    }

    return function escapeFields(fields) {
        var i = -1, l = fields.length, ret = [], field;
        while (++i < l) {
            field = fields[i];
            field = (isUndefinedOrNull(field) ? "" : field) + "";
            ret.push(escapeField(field));
        }
        return ret.join(delimiter);
    };
}

function defaultTransform(row) {
    return row;
}

function __write(writer, arr, options) {
    options = options || {};
    var formatter = createFormatter(options),
        transformer = extended.has(options, "transform") ? options.transform : defaultTransform,
        hasHeaders = extended.has(options, "headers") ? options.headers : true,
        headersLength = 0,
        i = -1,
        j = -1,
        l = arr.length,
        ret = [];
    if (l) {
        var item = arr[0], isHash = !extended.isArray(item), headers, vals;
        item = transformer(item);
        if (hasHeaders) {
            if (isHash) {
                headers = hash.keys(item);
            } else {
                headers = item;
                i++;
            }
            headersLength = headers.length;
            ret.push(formatter(headers));
        }
        while (++i < l) {
            item = transformer(arr[i]);
            vals = item;
            if (hasHeaders && isHash) {
                j = -1;
                vals = [];
                while (++j < headersLength) {
                    vals[j] = item[headers[j]];
                }
            } else if (isHash) {
                j = -1;
                while (++j < headersLength) {
                    vals[j] = item[j];
                }
            }
            ret.push(formatter(vals));
        }
        writer.push(ret.join(LINE_BREAK));
    }
}

var transformStreamWrite = Transform.prototype.write;

function CsvTransformStream(options) {
    options = options || {};
    Transform.call(this, options);
    this.formatter = createFormatter(options);
    var hasHeaders = this.hasHeaders = extended.has(options, "headers") ? options.headers : true;
    this.parsedHeaders = hasHeaders ? false : true;
    this.buffer = [];
    this.maxBufferSize = options.maxBuffer || 100000;
    extended.has(options, "transform") && this.transform(options.transform);
}

util.inherits(CsvTransformStream, Transform);

extended(CsvTransformStream).extend({

    headers: null,

    headersLength: 0,

    totalCount: 0,

    write: function (item) {
        var buffer = this.buffer, headers = this.headers;
        if (item) {
            item = this.__transform(item);
            var isHash = !extended.isArray(item), vals;
            if (!this.parsedHeaders) {
                this.totalCount++;
                this.parsedHeaders = true;
                if (isHash) {
                    headers = this.headers = hash.keys(item);
                } else {
                    headers = this.headers = item;
                }
                this.headersLength = headers.length;
                buffer.push(this.formatter(headers));
                if (!isHash) {
                    return;
                }
            }
            if (this.totalCount++) {
                buffer.push("\n");
            }
            if (isHash) {
                var i = -1, headersLength = this.headersLength;
                vals = [];
                while (++i < headersLength) {
                    vals[i] = item[headers[i]];
                }
            } else {
                vals = item;
            }
            buffer.push(this.formatter(vals));
            if (buffer.length >= this.maxBufferSize) {
                transformStreamWrite.call(this, new Buffer(buffer.join("")).toString("utf8"));
                buffer.length = 0;
            }
        } else {
            if (buffer.length) {
                transformStreamWrite.call(this, new Buffer(buffer.join("")).toString("utf8"));
                buffer.length = 0;
            }
            this.end();
        }
    },

    __transform: defaultTransform,

    transform: function (cb) {
        if (!extended.isFunction(cb)) {
            throw new TypeError("fast-csv.Parser#transform requires a function");
        }
        this.__transform = cb;
        return this;
    },

    _transform: function (str, encoding, cb) {
        cb(null, str);
    },
    _flush: function (cb) {
        this.write(null);
        cb(null);
    }
});

function createWriteStream(options) {
    return new CsvTransformStream(options);
}

function write(arr, options) {
    var csvStream = createWriteStream(options), i = -1, l = arr.length;
    while (++i < l) {
        csvStream.write(arr[i]);
    }
    csvStream.write(null);
    return csvStream;
}

function writeToStream(ws, arr, options) {
    return write(arr, options).pipe(ws);
}

function writeToString(arr, options) {
    var writer = [];
    __write(writer, arr, options);
    return writer.join("");
}

function writeToPath(path, arr, options) {
    var stream = fs.createWriteStream(path, {encoding: "utf8"});
    return write(arr, options).pipe(stream);
}


createFormatter.write = write;
createFormatter.createWriteStream = createWriteStream;
createFormatter.writeToString = writeToString;
createFormatter.writeToPath = writeToPath;
createFormatter.writeToStream = writeToStream;
module.exports = createFormatter;