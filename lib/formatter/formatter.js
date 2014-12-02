var fs = require("fs"),
    extended = require("../extended"),
    has = extended.has,
    isBoolean = extended.isBoolean,
    isUndefinedOrNull = extended.isUndefinedOrNull,
    escape = extended.escape,
    isArray = extended.isArray,
    keys = extended.keys,
    stream = require("stream"),
    LINE_BREAK = extended.LINE_BREAK;

function createQuoteChecker(stream, quoteColumns, quoteHeaders) {
    var shouldQuote;
    if (isBoolean(quoteColumns)) {
        if (isBoolean(quoteHeaders)) {
            shouldQuote = function shouldQuote(index, isHeader) {
                return (isHeader ? quoteHeaders : quoteColumns);
            };
        } else if (isArray(quoteHeaders)) {
            shouldQuote = function shouldQuote(index, isHeader) {
                return isHeader ? quoteHeaders[index] : quoteColumns;
            };
        } else {
            shouldQuote = function shouldQuote(index, isHeader) {
                return isHeader ? quoteHeaders[stream.headers[index]] : quoteColumns;
            };
        }
    } else if (isArray(quoteColumns)) {
        if (isBoolean(quoteHeaders)) {
            shouldQuote = function shouldQuote(index, isHeader) {
                return isHeader ? quoteHeaders : quoteColumns[index];
            };
        } else {
            shouldQuote = function shouldQuote(index, isHeader) {
                return isHeader ? quoteHeaders[index] : quoteColumns[index];
            };
        }
    } else {
        if (isBoolean(quoteHeaders)) {
            shouldQuote = function shouldQuote(index, isHeader) {
                return isHeader ? quoteHeaders : quoteColumns[stream.headers[index]];
            };
        } else {
            shouldQuote = function shouldQuote(index, isHeader) {
                return isHeader ? quoteHeaders[stream.headers[index]] : quoteColumns[stream.headers[index]];
            };
        }
    }
    return shouldQuote;
}

function createFormatter(options, stream) {
    options = options || {};
    var delimiter = options.delimiter || ",",
        ESCAPE_REGEXP = new RegExp("[" + delimiter + escape(options.rowDelimiter || LINE_BREAK) + "']"),
        QUOTE = options.quote || '"',
        ESCAPE = options.escape || '"',
        REPLACE_REGEXP = new RegExp(QUOTE, "g"),
        quoteColumns = has(options, "quoteColumns") ? options.quoteColumns : false,
        quoteHeaders = has(options, "quoteHeaders") ? options.quoteHeaders : quoteColumns,
        shouldQuote = createQuoteChecker(stream, quoteColumns, quoteHeaders);


    function escapeField(field, index, isHeader) {
        var escape;
        field = field.replace(/\0/g, '');
        if ((escape = field.indexOf(QUOTE) !== -1)) {
            field = field.replace(REPLACE_REGEXP, ESCAPE + QUOTE);
            escape = true;
        } else {
            escape = field.search(ESCAPE_REGEXP) !== -1;
        }
        escape = escape || shouldQuote(index, isHeader);
        if (escape) {
            field = [QUOTE + field + QUOTE];
        } else {
            field = [field];
        }
        return field.join("");
    }

    return function escapeFields(fields, isHeader) {
        var i = -1, l = fields.length, ret = [], field;
        while (++i < l) {
            field = fields[i];
            field = (isUndefinedOrNull(field) ? "" : field) + "";
            ret.push(escapeField(field, i, isHeader));
        }
        return ret.join(delimiter);
    };
}

function defaultTransform(row, cb) {
    return cb(null, row);
}


function isHashArray(arr) {
    return isArray(arr) && isArray(arr[0]) && arr[0].length === 2;
}

//get headers from a row item
function gatherHeaders(item) {
    var ret, i, l;
    if (isHashArray(item)) {
        //lets assume a multidimesional array with item 0 bing the title
        i = -1;
        l = item.length;
        ret = [];
        while (++i < l) {
            ret[i] = item[i][0];
        }
    } else if (isArray(item)) {
        ret = item;
    } else {
        ret = keys(item);
    }
    return ret;
}

//check if we need to write header return true if we should also write a row
//could be false if headers is true and the header row(first item) is passed in
function checkHeaders(stream, item) {
    var headers, ret = true;
    if (!stream.parsedHeaders) {
        stream.parsedHeaders = true;
        headers = stream.headers = gatherHeaders(item);
        stream.headersLength = headers.length;
    }
    if (!stream.hasWrittenHeaders) {
        stream.totalCount++;
        stream.push(new Buffer(stream.formatter(stream.headers, true), "utf8"));
        stream.hasWrittenHeaders = true;
        ret = isHashArray(item) || !isArray(item);
    }
    return ret;
}

//transform an object into a CSV row
function transformHashData(stream, item) {
    var vals = [], row = [], headers = stream.headers, i = -1, headersLength = stream.headersLength;
    if (stream.totalCount++) {
        row.push(stream.rowDelimiter);
    }
    while (++i < headersLength) {
        vals[i] = item[headers[i]];
    }
    row.push(stream.formatter(vals));
    return row.join("");
}

//transform an array into a CSV row
function transformArrayData(stream, item, cb) {
    var row = [];
    if (stream.totalCount++) {
        row.push(stream.rowDelimiter);
    }
    row.push(stream.formatter(item));
    return row.join("");
}

//transform an array of two item arrays into a CSV row
function transformHashArrayData(stream, item) {
    var vals = [], row = [], i = -1, headersLength = stream.headersLength;
    if (stream.totalCount++) {
        row.push(stream.rowDelimiter);
    }
    while (++i < headersLength) {
        vals[i] = item[i][1];
    }
    row.push(stream.formatter(vals));
    return row.join("");
}

//wrapper to determin what transform to run
function transformItem(stream, item) {
    var ret;
    if (isArray(item)) {
        if (isHashArray(item)) {
            ret = transformHashArrayData(stream, item);
        } else {
            ret = transformArrayData(stream, item);
        }
    } else {
        ret = transformHashData(stream, item);
    }
    return ret;
}

exports.createFormatter = createFormatter;
exports.transformItem = transformItem;
exports.checkHeaders = checkHeaders;
exports.defaultTransform = defaultTransform;
