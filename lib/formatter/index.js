var fs = require("fs"),
    extended = require("../extended"),
    escape = extended.escape,
    stream = require("stream"),
    LINE_BREAK = extended.LINE_BREAK,
    CsvTransformStream = require("./formatter_stream");


function createWriteStream(options) {
    return new CsvTransformStream(options);
}

function write(arr, options, ws) {
    var csvStream = createWriteStream(options), i = -1, l = arr.length;
    extended.asyncEach(arr, function (item, cb) {
        csvStream.write(item, null, cb);
    }, function (err) {
        if (err) {
            csvStream.emit("error", err);
        } else {
            csvStream.end();
        }
    });
    return csvStream;
}

function writeToStream(ws, arr, options) {
    return write(arr, options).pipe(ws);
}

function writeToString(arr, options, cb) {
    if (extended.isFunction(options)) {
        cb = options;
        options = {};
    }
    var ws = new stream.Writable(), written = [];
    ws._write = function (data, enc, cb) {
        written.push(data + "");
        cb();
    };
    ws
        .on("error", cb)
        .on("finish", function () {
            cb(null, written.join(""));
        });
    write(arr, options).pipe(ws);
}


function writeToBuffer(arr, options, cb) {
    if (extended.isFunction(options)) {
        cb = options;
        options = {};
    }
    var ws = new stream.Writable(), buffers = [], l = 0;
    ws._write = function (data, enc, cb) {
        buffers.push(data);
        l++;
        cb();
    };
    ws
        .on("error", cb)
        .on("finish", function () {
            cb(null, Buffer.concat(buffers));
        });
    write(arr, options).pipe(ws);
}

function writeToPath(path, arr, options) {
    var stream = fs.createWriteStream(path, {encoding: "utf8"});
    return write(arr, options).pipe(stream);
}

createWriteStream.writeToBuffer = writeToBuffer;
createWriteStream.write = write;
createWriteStream.createWriteStream = createWriteStream;
createWriteStream.writeToString = writeToString;
createWriteStream.writeToPath = writeToPath;
createWriteStream.writeToStream = writeToStream;
module.exports = createWriteStream;
