var it = require("it"),
    assert = require("assert"),
    fs = require("fs"),
    csv = require("../index"),
    path = require("path"),
    stream = require("stream");

it.describe("fast-csv formatting", function (it) {

    it.timeout(60000);

    it.describe(".writeToStream", function (it) {

        it.should("write an array of arrays", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "a,b\na1,b1\na2,b2");
                next();
            });
            csv.writeToStream(ws, [
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ], {headers: true}).on("error", next);
        });

        it.should("support transforming an array of arrays", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "A,B\nA1,B1\nA2,B2");
                next();
            });
            csv.writeToStream(ws, [
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ], {
                headers: true,
                transform: function (row) {
                    return row.map(function (entry) {
                        return entry.toUpperCase();
                    });
                }
            }).on("error", next);
        });

        it.should("support transforming an array of multi-dimensional arrays", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "a,b\nA1,B1\nA2,B2");
                next();
            });
            csv.writeToStream(ws, [
                [["a", "a1"], ["b", "b1"]],
                [["a", "a2"], ["b", "b2"]]
            ], {
                headers: true,
                transform: function (row) {
                    return row.map(function (entry) {
                        entry[1] = entry[1].toUpperCase();
                        return entry;
                    });
                }
            }).on("error", next);
        });


        it.should("write an array of objects", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "a,b\na1,b1\na2,b2");
                next();
            });
            csv.writeToStream(ws, [
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ], {headers: true}).on("error", next);
        });

        it.should("support transforming an array of objects", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "A,B\na1,b1\na2,b2");
                next();
            });
            csv.writeToStream(ws, [
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ], {
                headers: true,
                transform: function (row) {
                    return {
                        A: row.a,
                        B: row.b
                    };
                }
            }).on("error", next);
        });

        it.describe("rowDelimiter option", function (it) {
            it.should("support specifying an alternate row delimiter", function (next) {
                var ws = new stream.Writable(), written = [];
                ws._write = function (data, enc, cb) {
                    written.push(data + "");
                    cb();
                };
                ws.on("finish", function () {
                    assert.deepEqual(written.join(""), "a,b\r\na1,b1\r\na2,b2");
                    next();
                });
                csv.writeToStream(ws, [
                    {a: "a1", b: "b1"},
                    {a: "a2", b: "b2"}
                ], {headers: true, rowDelimiter: "\r\n"}).on("error", next);
            });

            it.should("escape values that contain the alternate row delimiter", function (next) {
                var ws = new stream.Writable(), written = [];
                ws._write = function (data, enc, cb) {
                    written.push(data + "");
                    cb();
                };
                ws.on("finish", function () {
                    assert.deepEqual(written.join(""), "a,b\t\"a\t1\",b1\t\"a\t2\",b2");
                    next();
                });
                csv.writeToStream(ws, [
                    {a: "a\t1", b: "b1"},
                    {a: "a\t2", b: "b2"}
                ], {headers: true, rowDelimiter: "\t"}).on("error", next);
            });
        });

        it.describe("quoteColumns option", function (it) {

            it.describe("quote all columns and headers if quoteColumns is true and quoteHeaders is false", function (it) {
                it.should("work with objects", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a","b"\n"a1","b1"\n"a2","b2"');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteColumns: true}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a","b"\n"a1","b1"\n"a2","b2"');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteColumns: true}).on("error", next);
                });

                it.should("work with multi-dimenional arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a","b"\n"a1","b1"\n"a2","b2"');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteColumns: true}).on("error", next);
                });
            });

            it.describe("quote headers if quoteHeaders is true and not columns is quoteColumns is undefined", function (it) {

                it.should("work with objects", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a","b"\na1,b1\na2,b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteHeaders: true}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a","b"\na1,b1\na2,b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteHeaders: true}).on("error", next);
                });

                it.should("work with multi-dimensional arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a","b"\na1,b1\na2,b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteHeaders: true}).on("error", next);
                });
            });

            it.describe("quote columns if quoteColumns is true and not quote headers if quoteHeaders is false", function (it) {
                it.should("work with objects", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,b\n"a1","b1"\n"a2","b2"');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteColumns: true, quoteHeaders: false}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,b\n"a1","b1"\n"a2","b2"');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteColumns: true, quoteHeaders: false}).on("error", next);
                });

                it.should("work with multi-dimensional arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,b\n"a1","b1"\n"a2","b2"');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteColumns: true, quoteHeaders: false}).on("error", next);
                });
            });

            it.describe("if quoteColumns object it should only quote the specified column and header", function (it) {
                it.should("work with objects", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a",b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteColumns: {a: true}}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a",b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteColumns: {a: true}}).on("error", next);
                });

                it.should("work with multi dimensional arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a",b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteColumns: {a: true}}).on("error", next);
                });
            });

            it.describe("if quoteColumns object and quoteHeaders is false it should only quote the specified column and not the header", function (it) {
                it.should("work with objects", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteColumns: {a: true}, quoteHeaders: false}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteColumns: {a: true}, quoteHeaders: false}).on("error", next);
                });

                it.should("work with multi-dimensional arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteColumns: {a: true}, quoteHeaders: false}).on("error", next);
                });
            });

            it.describe("if quoteColumns is an array it should only quote the specified column index", function (it) {
                it.should("work with objects", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a",b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteColumns: [true]}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a",b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteColumns: [true]}).on("error", next);
                });

                it.should("work with multi-dimensional arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a",b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteColumns: [true]}).on("error", next);
                });
            });

            it.describe("if quoteColumns object and quoteHeaders is false it should only quote the specified column and not the header", function (it) {
                it.should("work with objects", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteColumns: {a: true}, quoteHeaders: false}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteColumns: {a: true}, quoteHeaders: false}).on("error", next);
                });

                it.should("work with multidimenional", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,b\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteColumns: {a: true}, quoteHeaders: false}).on("error", next);
                });
            });

            it.describe("if quoteColumns is false and quoteHeaders is an object it should only quote the specified header and not the column", function (it) {
                it.should("work with object", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a",b\na1,b1\na2,b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteHeaders: {a: true}, quoteColumns: false}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a",b\na1,b1\na2,b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteHeaders: {a: true}, quoteColumns: false}).on("error", next);
                });

                it.should("work with multi-dimenional arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), '"a",b\na1,b1\na2,b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteHeaders: {a: true}, quoteColumns: false}).on("error", next);
                });
            });

            it.describe("if quoteColumns is an object and quoteHeaders is an object it should only quote the specified header and column", function (it) {

                it.should("work with objects", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,"b"\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteHeaders: {b: true}, quoteColumns: {a: true}}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,"b"\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteHeaders: {b: true}, quoteColumns: {a: true}}).on("error", next);
                });

                it.should("work with multi-dimensional arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,"b"\n"a1",b1\n"a2",b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteHeaders: {b: true}, quoteColumns: {a: true}}).on("error", next);
                });
            });

            it.describe("if quoteHeaders is an array and quoteColumns is an false it should only quote the specified header and not the column", function (it) {
                it.should("work with objects", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,"b"\na1,b1\na2,b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, quoteHeaders: [false, true], quoteColumns: false}).on("error", next);
                });

                it.should("work with arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,"b"\na1,b1\na2,b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        ["a", "b"],
                        ["a1", "b1"],
                        ["a2", "b2"]
                    ], {headers: true, quoteHeaders: [false, true], quoteColumns: false}).on("error", next);
                });

                it.should("work with arrays of multi-dimensional arrays", function (next) {
                    var ws = new stream.Writable(), written = [];
                    ws._write = function (data, enc, cb) {
                        written.push(data + "");
                        cb();
                    };
                    ws.on("finish", function () {
                        assert.deepEqual(written.join(""), 'a,"b"\na1,b1\na2,b2');
                        next();
                    });
                    csv.writeToStream(ws, [
                        [["a", "a1"], ["b", "b1"]],
                        [["a", "a2"], ["b", "b2"]]
                    ], {headers: true, quoteHeaders: [false, true], quoteColumns: false}).on("error", next);
                });
            });

        });

        it.should("add a final rowDelimiter if includeEndRowDelimiter is true", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "a,b\na1,b1\na2,b2\n");
                next();
            });
            csv.writeToStream(ws, [
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ], {headers: true, includeEndRowDelimiter: true}).on("error", next);
        });
    });

    it.describe(".writeToString", function (it) {

        it.should("write an array of arrays", function (next) {
            csv.writeToString([
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ], {headers: true}, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.equal(csv, "a,b\na1,b1\na2,b2");
                    next();
                }
            });
        });

        it.should("support transforming an array of arrays", function (next) {
            csv.writeToString([
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ], {
                headers: true,
                transform: function (row) {
                    return row.map(function (entry) {
                        return entry.toUpperCase();
                    });
                }
            }, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.equal(csv, "A,B\nA1,B1\nA2,B2");
                    next();
                }
            });
        });

        it.should("write an array of multi-dimensional arrays", function (next) {
            csv.writeToString([
                [["a", "a1"], ["b", "b1"]],
                [["a", "a2"], ["b", "b2"]]
            ], {headers: true}, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.equal(csv, "a,b\na1,b1\na2,b2");
                    next();
                }
            });
        });

        it.should("support transforming an array of multi-dimensional arrays", function (next) {
            csv.writeToString([
                [["a", "a1"], ["b", "b1"]],
                [["a", "a2"], ["b", "b2"]]
            ], {
                headers: true,
                transform: function (row) {
                    return row.map(function (col) {
                        col[1] = col[1].toUpperCase();
                        return col;
                    });
                }
            }, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.equal(csv, "a,b\nA1,B1\nA2,B2");
                    next();
                }
            });
        });


        it.should("write an array of objects", function (next) {
            csv.writeToString([
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ], {
                headers: true,
                transform: function (row) {
                    return {
                        A: row.a,
                        B: row.b
                    };
                }
            }, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.equal(csv, "A,B\na1,b1\na2,b2");
                    next();
                }
            });
        });

        it.describe("header option", function (it) {

            it.should("write an array of objects without headers", function (next) {
                csv.writeToString([
                    {a: "a1", b: "b1"},
                    {a: "a2", b: "b2"}
                ], {
                    headers: false
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.equal(csv, "a1,b1\na2,b2");
                        next();
                    }
                });
            });

            it.should("write an array of objects with headers", function (next) {
                csv.writeToString([
                    {a: "a1", b: "b1"},
                    {a: "a2", b: "b2"}
                ], {
                    headers: true
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.equal(csv, "a,b\na1,b1\na2,b2");
                        next();
                    }
                });
            });

            it.should("write an array of arrays without headers", function (next) {
                csv.writeToString([
                    ["a1", "b1"],
                    ["a2", "b2"]
                ], {
                    headers: false
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.equal(csv, "a1,b1\na2,b2");
                        next();
                    }
                });
            });

            it.should("write an array of arrays with headers", function (next) {
                csv.writeToString([
                    ["a", "b"],
                    ["a1", "b1"],
                    ["a2", "b2"]
                ], {
                    headers: true
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.equal(csv, "a,b\na1,b1\na2,b2");
                        next();
                    }
                });
            });

            it.should("write an array of multi-dimensional arrays without headers", function (next) {
                csv.writeToString([
                    [["a", "a1"], ["b", "b1"]],
                    [["a", "a2"], ["b", "b2"]],
                ], {
                    headers: false
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.equal(csv, "a1,b1\na2,b2");
                        next();
                    }
                });
            });

            it.should("write an array of multi-dimensional arrays with headers", function (next) {
                csv.writeToString([
                    [["a", "a1"], ["b", "b1"]],
                    [["a", "a2"], ["b", "b2"]],
                ], {
                    headers: true
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.equal(csv, "a,b\na1,b1\na2,b2");
                        next();
                    }
                });
            });
        });


        it.describe("rowDelimiter option", function (it) {
            it.should("support specifying an alternate row delimiter", function (next) {
                csv.writeToString([
                    {a: "a1", b: "b1"},
                    {a: "a2", b: "b2"}
                ], {
                    headers: true,
                    rowDelimiter: '\r\n'
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.equal(csv, "a,b\r\na1,b1\r\na2,b2");
                        next();
                    }
                });
            });
            it.should("escape values that contain the alternate row delimiter", function (next) {
                csv.writeToString([
                    {a: "a\t1", b: "b1"},
                    {a: "a\t2", b: "b2"}
                ], {
                    headers: true,
                    rowDelimiter: '\t'
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.equal(csv, "a,b\t\"a\t1\",b1\t\"a\t2\",b2");
                        next();
                    }
                });
            });
        });

        it.should("add a final rowDelimiter if includeEndRowDelimiter is true", function (next) {
            csv.writeToString([
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ], {
                headers: true,
                includeEndRowDelimiter: true
            }, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.equal(csv, "a,b\na1,b1\na2,b2\n");
                    next();
                }

            });
        });
    });

    it.describe(".writeToBuffer", function (it) {

        it.should("write an array of arrays", function (next) {
            csv.writeToBuffer([
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ], {headers: true}, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.instanceOf(csv, Buffer);
                    assert.equal(csv, "a,b\na1,b1\na2,b2");
                    next();
                }
            });
        });

        it.should("support transforming an array of arrays", function (next) {
            csv.writeToBuffer([
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ], {
                headers: true,
                transform: function (row) {
                    return row.map(function (entry) {
                        return entry.toUpperCase();
                    });
                }
            }, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.instanceOf(csv, Buffer);
                    assert.equal(csv, "A,B\nA1,B1\nA2,B2");
                    next();
                }
            });
        });

        it.should("write an array of multi-dimensional arrays", function (next) {
            csv.writeToBuffer([
                [["a", "a1"], ["b", "b1"]],
                [["a", "a2"], ["b", "b2"]]
            ], {headers: true}, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.instanceOf(csv, Buffer);
                    assert.equal(csv, "a,b\na1,b1\na2,b2");
                    next();
                }
            });
        });

        it.should("support transforming an array of multi-dimensional arrays", function (next) {
            csv.writeToBuffer([
                [["a", "a1"], ["b", "b1"]],
                [["a", "a2"], ["b", "b2"]]
            ], {
                headers: true,
                transform: function (row) {
                    return row.map(function (col) {
                        col[1] = col[1].toUpperCase();
                        return col;
                    });
                }
            }, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.instanceOf(csv, Buffer);
                    assert.equal(csv, "a,b\nA1,B1\nA2,B2");
                    next();
                }
            });
        });


        it.should("write an array of objects", function (next) {
            csv.writeToBuffer([
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ], {
                headers: true,
                transform: function (row) {
                    return {
                        A: row.a,
                        B: row.b
                    };
                }
            }, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.instanceOf(csv, Buffer);
                    assert.equal(csv, "A,B\na1,b1\na2,b2");
                    next();
                }
            });
        });

        it.describe("rowDelimiter option", function (it) {
            it.should("support specifying an alternate row delimiter", function (next) {
                csv.writeToBuffer([
                    {a: "a1", b: "b1"},
                    {a: "a2", b: "b2"}
                ], {
                    headers: true,
                    rowDelimiter: '\r\n'
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.instanceOf(csv, Buffer);
                        assert.equal(csv, "a,b\r\na1,b1\r\na2,b2");
                        next();
                    }
                });
            });
            it.should("escape values that contain the alternate row delimiter", function (next) {
                csv.writeToBuffer([
                    {a: "a\t1", b: "b1"},
                    {a: "a\t2", b: "b2"}
                ], {
                    headers: true,
                    rowDelimiter: '\t'
                }, function (err, csv) {
                    if (err) {
                        next(err);
                    } else {
                        assert.instanceOf(csv, Buffer);
                        assert.equal(csv, "a,b\t\"a\t1\",b1\t\"a\t2\",b2");
                        next();
                    }
                });
            });
        });

        it.should("add a final rowDelimiter if includeEndRowDelimiter is true", function (next) {
            csv.writeToBuffer([
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ], {
                headers: true,
                includeEndRowDelimiter: true
            }, function (err, csv) {
                if (err) {
                    next(err);
                } else {
                    assert.instanceOf(csv, Buffer);
                    assert.equal(csv, "a,b\na1,b1\na2,b2\n");
                    next();
                }

            });
        });
    });

    it.describe(".write", function (it) {

        it.should("write an array of arrays", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "a,b\na1,b1\na2,b2");
                next();
            });
            csv.write([
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ], {headers: true}).on("error", next).pipe(ws);
        });

        it.should("support transforming an array of arrays", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "A,B\nA1,B1\nA2,B2");
                next();
            });
            var data = [
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ];
            csv.write(data, {
                headers: true,
                transform: function (row) {
                    return row.map(function (entry) {
                        return entry.toUpperCase();
                    });
                }
            }).on("error", next).pipe(ws);
        });

        it.should("write an array of multi-dimensional arrays", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "a,b\na1,b1\na2,b2");
                next();
            });
            csv.write([
                [["a", "a1"], ["b", "b1"]],
                [["a", "a2"], ["b", "b2"]]
            ], {headers: true}).on("error", next).pipe(ws);
        });

        it.should("support transforming an array of multi-dimensional arrays", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "a,b\nA1,B1\nA2,B2");
                next();
            });
            csv.write([
                [["a", "a1"], ["b", "b1"]],
                [["a", "a2"], ["b", "b2"]]
            ], {
                headers: true,
                transform: function (row) {
                    return row.map(function (col) {
                        col[1] = col[1].toUpperCase();
                        return col;
                    });
                }
            }).on("error", next).pipe(ws);
        });

        it.should("write an array of objects", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "a,b\na1,b1\na2,b2");
                next();
            });
            csv.write([
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ], {headers: true}).on("error", next).pipe(ws);
        });

        it.should("support transforming an array of objects", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "A,B\na1,b1\na2,b2");
                next();
            });
            var data = [
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ];
            csv.write(data, {
                headers: true,
                transform: function (row) {
                    return {
                        A: row.a,
                        B: row.b
                    };
                }
            }).on("error", next).pipe(ws);
        });

        it.describe("rowDelimiter option", function (it) {

            it.should("support specifying an alternate row delimiter", function (next) {
                var ws = new stream.Writable(), written = [];
                ws._write = function (data, enc, cb) {
                    written.push(data + "");
                    cb();
                };
                ws.on("finish", function () {
                    assert.deepEqual(written.join(""), "a,b\r\na1,b1\r\na2,b2");
                    next();
                });
                csv.write([
                    {a: "a1", b: "b1"},
                    {a: "a2", b: "b2"}
                ], {headers: true, rowDelimiter: '\r\n'}).on("error", next).pipe(ws);
            });

            it.should("escape values that contain the alternate row delimiter", function (next) {
                var ws = new stream.Writable(), written = [];
                ws._write = function (data, enc, cb) {
                    written.push(data + "");
                    cb();
                };
                ws.on("finish", function () {
                    assert.deepEqual(written.join(""), "a,b\t\"a\t1\",b1\t\"a\t2\",b2");
                    next();
                });
                csv.write([
                    {a: "a\t1", b: "b1"},
                    {a: "a\t2", b: "b2"}
                ], {headers: true, rowDelimiter: '\t'}).on("error", next).pipe(ws);
            });
        });

        it.should("add a final rowDelimiter if includeEndRowDelimiter is true", function (next) {
            var ws = new stream.Writable(), written = [];
            ws._write = function (data, enc, cb) {
                written.push(data + "");
                cb();
            };
            ws.on("finish", function () {
                assert.deepEqual(written.join(""), "a,b\na1,b1\na2,b2\n");
                next();
            });
            csv.write([
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ], {headers: true, includeEndRowDelimiter: true}).on("error", next).pipe(ws);
        });
    });

    it.describe(".writeToPath", function (it) {

        it.should("write an array of arrays", function (next) {
            csv
                .writeToPath(path.resolve(__dirname, "assets/test.csv"), [
                    ["a", "b"],
                    ["a1", "b1"],
                    ["a2", "b2"]
                ], {headers: true})
                .on("error", next)
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\na1,b1\na2,b2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
        });

        it.should("support transforming an array of arrays", function (next) {
            var data = [
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ];
            csv
                .writeToPath(path.resolve(__dirname, "assets/test.csv"), data, {
                    headers: true,
                    transform: function (row) {
                        return row.map(function (entry) {
                            return entry.toUpperCase();
                        });
                    }
                })
                .on("error", next)
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "A,B\nA1,B1\nA2,B2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
        });

        it.should("transforming an array of multi-dimensional array", function (next) {
            csv
                .writeToPath(path.resolve(__dirname, "assets/test.csv"), [
                    [["a", "a1"], ["b", "b1"]],
                    [["a", "a2"], ["b", "b2"]]
                ], {
                    headers: true,
                    transform: function (row) {
                        return row.map(function (col) {
                            col[1] = col[1].toUpperCase();
                            return col;
                        });
                    }
                })
                .on("error", next)
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\nA1,B1\nA2,B2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
        });


        it.should("write an array of objects", function (next) {
            csv
                .writeToPath(path.resolve(__dirname, "assets/test.csv"), [
                    {a: "a1", b: "b1"},
                    {a: "a2", b: "b2"}
                ], {headers: true})
                .on("error", next)
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\na1,b1\na2,b2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
        });

        it.should("support transforming an array of objects", function (next) {
            var data = [
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ];
            csv
                .writeToPath(path.resolve(__dirname, "assets/test.csv"), data, {
                    headers: true,
                    transform: function (row) {
                        return {
                            A: row.a,
                            B: row.b
                        };
                    }
                })
                .on("error", next)
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "A,B\na1,b1\na2,b2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
        });

        it.describe("rowDelimiter option", function (it) {

            it.should("support specifying an alternate row delimiter", function (next) {
                csv
                    .writeToPath(path.resolve(__dirname, "assets/test.csv"), [
                        {a: "a1", b: "b1"},
                        {a: "a2", b: "b2"}
                    ], {headers: true, rowDelimiter: '\r\n'})
                    .on("error", next)
                    .on("finish", function () {
                        assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\r\na1,b1\r\na2,b2");
                        fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                        next();
                    });
            });

            it.should("escape values that contain the alternate row delimiter", function (next) {
                csv
                    .writeToPath(path.resolve(__dirname, "assets/test.csv"), [
                        {a: "a\t1", b: "b1"},
                        {a: "a\t2", b: "b2"}
                    ], {headers: true, rowDelimiter: '\t'})
                    .on("error", next)
                    .on("finish", function () {
                        assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\t\"a\t1\",b1\t\"a\t2\",b2");
                        fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                        next();
                    });
            });
        });

        it.should("add a final rowDelimiter if includeEndRowDelimiter is true", function (next) {
            csv
                .writeToPath(path.resolve(__dirname, "assets/test.csv"), [
                    {a: "a1", b: "b1"},
                    {a: "a2", b: "b2"}
                ], {headers: true, includeEndRowDelimiter: true})
                .on("error", next)
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\na1,b1\na2,b2\n");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
        });
    });

    it.describe(".createWriteStream", function (it) {

        it.should("write an array of arrays", function (next) {
            var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
            var stream = csv
                .createWriteStream({headers: true})
                .on("error", next);
            writable
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\na1,b1\na2,b2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
            stream.pipe(writable);
            var vals = [
                ["a", "b"],
                ["a1", "b1"],
                ["a2", "b2"]
            ];
            vals.forEach(function (item) {
                stream.write(item);
            });
            stream.end();

        });


        it.should("write an array of multidimesional arrays", function (next) {
            var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
            var stream = csv
                .createWriteStream({headers: true})
                .on("error", next);
            writable
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\na1,b1\na2,b2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
            stream.pipe(writable);
            var vals = [
                [["a", "a1"], ["b", "b1"]],
                [["a", "a2"], ["b", "b2"]]
            ];
            vals.forEach(function (item) {
                stream.write(item);
            });
            stream.end();

        });


        it.should("transforming an array of multidimesional arrays", function (next) {
            var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
            var stream = csv
                .createWriteStream({headers: true})
                .transform(function (row) {
                    return row.map(function (col) {
                        col[1] = col[1].toUpperCase();
                        return col;
                    });
                })
                .on("error", next);
            writable
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\nA1,B1\nA2,B2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
            stream.pipe(writable);
            var vals = [
                [["a", "a1"], ["b", "b1"]],
                [["a", "a2"], ["b", "b2"]]
            ];
            vals.forEach(function (item) {
                stream.write(item);
            });
            stream.end();

        });

        it.should("write an array of objects", function (next) {
            var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
            var stream = csv
                .createWriteStream({headers: true})
                .on("error", next);
            writable
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\na1,b1\na2,b2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
            stream.pipe(writable);
            var vals = [
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ];
            vals.forEach(function (item) {
                stream.write(item);
            });
            stream.end();
        });

        it.should("should support transforming objects", function (next) {
            var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
            var stream = csv
                .createWriteStream({headers: true})
                .transform(function (obj) {
                    return {A: obj.a, B: obj.b};
                })
                .on("error", next);
            writable
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "A,B\na1,b1\na2,b2");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
            stream.pipe(writable);
            var vals = [
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ];
            vals.forEach(function (item) {
                stream.write(item);
            });
            stream.end();
        });

        it.describe("rowDelimiter option", function (it) {

            it.should("support specifying an alternate row delimiter", function (next) {
                var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
                var stream = csv
                    .createWriteStream({headers: true, rowDelimiter: '\r\n'})
                    .on("error", next);
                writable
                    .on("finish", function () {
                        assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\r\na1,b1\r\na2,b2");
                        fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                        next();
                    });
                stream.pipe(writable);
                var vals = [
                    {a: "a1", b: "b1"},
                    {a: "a2", b: "b2"}
                ];
                vals.forEach(function (item) {
                    stream.write(item);
                });
                stream.end();
            });

            it.should("escape values that contain the alternate row delimiter", function (next) {
                var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
                var stream = csv
                    .createWriteStream({headers: true, rowDelimiter: '\t'})
                    .on("error", next);
                writable
                    .on("finish", function () {
                        assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\t\"a\t1\",b1\t\"a\t2\",b2");
                        fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                        next();
                    });
                stream.pipe(writable);
                var vals = [
                    {a: "a\t1", b: "b1"},
                    {a: "a\t2", b: "b2"}
                ];
                vals.forEach(function (item) {
                    stream.write(item);
                });
                stream.end();
            });

        });

        it.should("add a final rowDelimiter if includeEndRowDelimiter is true", function (next) {
            var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
            var stream = csv
                .createWriteStream({headers: true, includeEndRowDelimiter: true})
                .on("error", next);
            writable
                .on("finish", function () {
                    assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\na1,b1\na2,b2\n");
                    fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                    next();
                });
            stream.pipe(writable);
            var vals = [
                {a: "a1", b: "b1"},
                {a: "a2", b: "b2"}
            ];
            vals.forEach(function (item) {
                stream.write(item);
            });
            stream.end();
        });


        it.describe("piping from parser to formatter", function (it) {

            it.should("allow piping from a parser to a formatter", function (next) {
                var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
                csv
                    .fromPath(path.resolve(__dirname, "./assets/test22.csv"), {headers: true, objectMode: true})
                    .on("error", next)
                    .pipe(csv.createWriteStream({headers: true}))
                    .on("error", next)
                    .pipe(writable)
                    .on("error", next);

                writable
                    .on("finish", function () {
                        assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\na1,b1\na2,b2");
                        fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                        next();
                    });
            });

            it.should("preserve transforms", function (next) {
                var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"});
                csv
                    .fromPath(path.resolve(__dirname, "./assets/test22.csv"), {headers: true})
                    .transform(function (obj) {
                        obj.a = obj.a + "-parsed";
                        obj.b = obj.b + "-parsed";
                        return obj;
                    })
                    .on("error", next)
                    .pipe(csv.createWriteStream({headers: true}))
                    .on("error", next)
                    .pipe(writable)
                    .on("error", next);

                writable
                    .on("finish", function () {
                        assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "a,b\na1-parsed,b1-parsed\na2-parsed,b2-parsed");
                        fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                        next();
                    });
            });
        });
    });
});
