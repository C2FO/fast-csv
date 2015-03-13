var it = require("it"),
    assert = require("assert"),
    fs = require("fs"),
    csv = require("../index"),
    path = require("path"),
    stream = require("stream"),
    utils = require("util"),
    domain = require('domain');


it.describe("github issues", function (it) {

    it.timeout(60000);

    it.describe("#68", function (it) {
        it.should("handle bubble up parse errors properly", function (next) {
            var d = domain.create(), called = false;
            d.on("error", function (err) {
                if(!called) {
                    called = true;
                    assert.equal(/^Parse Error/.test(err.message), true);
                    next();
                }
            });
            d.run(function () {
                var actual = [];
                csv
                    .fromPath(path.resolve(__dirname, "./assets/issue68-invalid.tsv"), {headers: true, delimiter: "\t"})
                    .on("data", function (data) {
                        actual.push(data);
                    })
                    .on("end", function (count) {
                        assert.equal(count, 20000);
                        throw new Error("End error");
                    });
            });
        });

        it.should("handle bubble up data errors properly", function (next) {
            var d = domain.create(), called = false;
            d.on("error", function (err) {
                if(!called) {
                    called = true;
                    assert.equal(err.message, "Data error");
                    next();
                }else{
                    throw err;
                }
            });
            d.run(function () {
                var actual = [], count = 0;
                csv
                    .fromPath(path.resolve(__dirname, "./assets/issue68.tsv"), {headers: true, delimiter: "\t"})
                    .on("data", function () {
                        if ((count++ % 1001) === 0) {
                            throw new Error("Data error");
                        }
                    });
            });
        });
    });

    it.describe("#77", function (it) {
        it.should("sort columns by order of headers defined", function (next) {
            var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"}),
                stream = csv.createWriteStream({headers: ["second", "first"]})
                    .on("error", next);

            writable.on("finish", function () {
                assert.equal(fs.readFileSync(path.resolve(__dirname, "assets/test.csv")).toString(), "second,first\n2,1");
                fs.unlinkSync(path.resolve(__dirname, "assets/test.csv"));
                next();
            });

            stream.pipe(writable);

            [{first: "1", second: "2"}].forEach(function (item) {
                stream.write(item);
            });

            stream.end();
        });

        it.should("write headers even with no data", function (next) {
            var writable = fs.createWriteStream(path.resolve(__dirname, "assets/test.csv"), {encoding: "utf8"}),
                stream = csv.createWriteStream({headers: ["first", "second"]})
                    .on("error", next);

            writable.on("finish", function () {
                assert.equal(fs.readFileSync(path.resolve(__dirname, 'assets/test.csv')).toString(), "first,second\n,");
                fs.unlinkSync(path.resolve(__dirname, 'assets/test.csv'));
                next();
            });

            stream.pipe(writable);

            [{}].forEach(function (item) {
                stream.write(item);
            });

            stream.end();

        });
    });

    it.describe("#87", function (it) {

        var MyStream = function MyStream() {
            stream.Transform.call(this, {objectMode: true, highWaterMark: 16});
            this.rowCount = 0;
        };
        utils.inherits(MyStream, stream.Transform);

        MyStream.prototype._transform = function (data, encoding, done) {
            this.rowCount++;
            if (this.rowCount % 2 === 0) {
                setTimeout(function () {
                    done();
                }, 10);
            } else {
                done();
            }
        };

        MyStream.prototype._flush = function (done) {
            done();
        };


        it.should("not emit end until data is flushed from source", function (next) {
            var myStream = new MyStream();

            fs
                .createReadStream(path.resolve(__dirname, "./assets/issue87.csv"))
                .pipe(csv({headers: true}))
                .on("error", next)
                .pipe(myStream)
                .on("error", next)
                .on("finish", function () {
                    assert.equal(myStream.rowCount, 99);
                    next();
                });
        });
    });

    it.describe("#93", function (it) {
        it.should("handle bubble up errors thrown in end properly", function (next) {
            var d = domain.create(), called = false;
            d.on("error", function (err) {
                if(!called) {
                    called = true;
                    assert.equal(err.message, "End error");
                    next();
                }else{
                    throw err;
                }
            });
            d.run(function () {
                var actual = [];
                csv
                    .fromPath(path.resolve(__dirname, "./assets/issue93.csv"), {headers: true, delimiter: "\t"})
                    .on("error", function(){
                        next(new Error("Should not get here!"));
                    })
                    .on("data", function (data) {})
                    .on("end", function () {
                        throw new Error("End error");
                    });
            });
        });
    });
});