var fs = require("fs"),
    extended = require("./extended"),
    hash = extended.hash,
    stream = require("stream"),
    LINE_BREAK = (process.platform === 'win32' ? '\r\n' : '\n');

function createFormatter(options) {
    options = options || {};
    var delimiter = options.delimeter || ",",
        ESCAPE_REGEXP = new RegExp("[" + delimiter + "']"),
        QUOTE = options.quote || '"',
        ESCAPE = options.escape || '"',
        REPLACE_REGEXP = new RegExp(QUOTE, "g");

    function escapeField(field) {
        var escape;
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
        var i = -1, l = fields.length, ret = [];
        while (++i < l) {
            ret.push(escapeField(fields[i]));
        }
        return ret.join(delimiter) + LINE_BREAK;
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
        writer.push(ret.join(""));
    }
}

function write(arr, options) {
    var writer = new stream.Readable();
    __write(writer, arr, options);
    writer.push(null);
    return writer;
}

function writeToStream(ws, arr, options) {
    var writer = new stream.Readable();
    __write(writer, arr, options);
    writer.push(null);
    writer.pipe(ws);
    return writer;
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

createFormatter.writeToString = writeToString;

createFormatter.writeToPath = writeToPath;

createFormatter.writeToStream = writeToStream;

module.exports = createFormatter;