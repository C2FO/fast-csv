/**
 * @projectName fast-csv
 * @github https://github.com/C2FO/fast-csv
 * @includeDoc [Change Log] ../History.md
 * @header [../README.md]
 */

var fs = require("fs"),
    extended = require("./extended"),
    ParserStream = require("./parser_stream"),
    stream = require("stream"),
    formatter = require("./formatter");

function parse(options) {
    return new ParserStream(options);
}

function toCsvStream(arr, options) {
    return formatter.writeToStream(arr, options);
}

function fromStream(stream, options) {
    return stream.pipe(new ParserStream(options));
}

function fromPath(location, options) {
    return fs.createReadStream(location).pipe(new ParserStream(options));
}

function fromString(string, options) {
    var rs = new stream.Readable();
    rs.push(string);
    rs.push(null);
    return rs.pipe(new ParserStream(options));
}


parse.fromString = fromString;
parse.toCsvStream = toCsvStream;
parse.fromPath = fromPath;
parse.fromStream = fromStream;
parse.write = formatter.write;
parse.writeToStream = formatter.writeToStream;
parse.writeToString = formatter.writeToString;
parse.writeToPath = formatter.writeToPath;
parse.createWriteStream = formatter.createWriteStream;

module.exports = parse;