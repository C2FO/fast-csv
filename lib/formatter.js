var fs = require("fs"),
    extended = require("./extended"),
    isUndefinedOrNull = extended.isUndefinedOrNull,
    hash = extended.hash,
    stream = require("stream"),
    LINE_BREAK = extended.LINE_BREAK;

function createFormatter(options) {
    options = options || {};
    var delimiter = options.delimeter || ",",
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

function __write(writer, arr, options) {
    options = options || {};
    var formatter = createFormatter(options),
        hasHeaders = extended.has(options, "headers") ? options.headers : true,
        i = -1,
        l = arr.length,
        ret = [];
    if (l) {
        var item = arr[0], isHash = !extended.isArray(item), headers;
        if (hasHeaders) {
            if (isHash) {
                headers = hash.keys(item);
            } else {
                headers = item;
                i++;
            }
            ret.push(formatter(headers));
        }
        while (++i < l) {
            item = arr[i];
            ret.push(formatter(isHash ? hash.values(item) : item));
        }
        writer.push(ret.join(LINE_BREAK));
    }
}

function wrapWriter(writer, options) {
    options = options || {};
    var formatter = createFormatter(options),
        hasHeaders = extended.has(options, "headers") ? options.headers : true,
        parsedHeaders = hasHeaders ? false : true,
        headersLength = 0, i = -1,
        writerWrite = writer.push, headers,
        buffer = [],
        totalCount = 0,
        MAX_BUFFER_SIZE = options.maxBuffer || 100000;

    writer.write = function (item) {
        if (item) {
            var isHash = !extended.isArray(item), vals;
            if (!parsedHeaders) {
                totalCount++
                parsedHeaders = true;
                if (isHash) {
                    headers = hash.keys(item);
                } else {
                    headers = item;
                }
                headersLength = headers.length;
                buffer.push(formatter(headers));
                if (!isHash) {
                    return;
                }
            }
            if (totalCount++) {
                buffer.push("\n");
            }
            if (isHash) {
                i = -1;
                vals = [];
                while (++i < headersLength) {
                    vals[i] = item[headers[i]];
                }
            } else {
                vals = item;
            }
            buffer.push(formatter(vals));
            if (buffer.length >= MAX_BUFFER_SIZE) {
                writerWrite.call(writer, new Buffer(buffer.join("")).toString("utf8"));
                buffer.length = 0;
            }
        } else {
            if (buffer.length) {
                writerWrite.call(writer, new Buffer(buffer.join("")).toString("utf8"));
                buffer.length = 0;
            }
            writerWrite.call(writer, null);
        }
    };
    return writer;
}

function createWriteStream(options) {
    var writer = new stream.Readable();
    writer._read = function () {
    };
    return wrapWriter(writer, options);
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
    write(arr, options).pipe(stream);
    return stream;
}


createFormatter.write = write;

createFormatter.createWriteStream = createWriteStream;

createFormatter.writeToString = writeToString;

createFormatter.writeToPath = writeToPath;

createFormatter.writeToStream = writeToStream;

module.exports = createFormatter;