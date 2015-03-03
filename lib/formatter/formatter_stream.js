var fs = require("fs"),
    util = require("util"),
    extended = require("../extended"),
    escape = extended.escape,
    isArray = extended.isArray,
    has = extended.has,
    stream = require("stream"),
    Transform = stream.Transform,
    LINE_BREAK = extended.LINE_BREAK,
    formatter = require("./formatter"),
    createFormatter = formatter.createFormatter,
    checkHeaders = formatter.checkHeaders,
    transformItem = formatter.transformItem,
    defaultTransform = formatter.defaultTransform;

function CsvTransformStream(options) {
    options = options || {};
    options.objectMode = true;
    Transform.call(this, options);
    this.formatter = createFormatter(options, this);
    this.rowDelimiter = options.rowDelimiter || "\n";
    var hasHeaders = has(options, "headers") ? !!options.headers : null,
        headers = (hasHeaders && isArray(options.headers)) ? options.headers : null;
    this.hasHeaders = hasHeaders;
    this.headers = headers;
    if (hasHeaders) {
        if (headers) {
            this.parsedHeaders = true;
            this.headersLength = headers.length;
        } else {
            this.parsedHeaders = false;
        }
    }
    this.hasWrittenHeaders = hasHeaders ? false : true;
    this.includeEndRowDelimiter = !!options.includeEndRowDelimiter,
    has(options, "transform") && this.transform(options.transform);
}
util.inherits(CsvTransformStream, Transform);

extended(CsvTransformStream).extend({

    headers: null,

    headersLength: 0,

    totalCount: 0,

    _transform: function (item, encoding, cb) {
        var self = this;
        this.__transform(item, function (err, item) {
            if (err) {
                cb(err);
            } else {
                if (checkHeaders(self, item)) {
                    self.push(new Buffer(transformItem(self, item), "utf8"));
                }
                cb();
            }
        });
    },

    __transform: defaultTransform,

    transform: function (cb) {
        if (!extended.isFunction(cb)) {
            this.emit("error", new TypeError("fast-csv.FormatterStream#transform requires a function"));
        }
        if (cb.length === 2) {
            this.__transform = cb;
        } else {
            this.__transform = function (data, next) {
                next(null, cb(data));
            };
        }
        return this;
    },

    _flush: function (cb) {
        if (this.includeEndRowDelimiter) {
            this.push(this.rowDelimiter);
        }
        cb();
    }
});

module.exports = CsvTransformStream;