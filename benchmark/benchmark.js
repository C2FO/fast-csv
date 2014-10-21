var fastCsv = require("../lib"),
    csv = require("csv"),
    path = require("path"),
    fs = require("fs");


function camelize(str) {
    return str.replace(/_(.)/g, function (a, b) {
        return b.toUpperCase();
    });
}

function benchmarkFastCsv(num, done) {
    var count = 0,
        file = path.resolve(__dirname, "./assets/" + num + ".csv");
    fastCsv
        .fromPath(file, {headers: true})
        .transform(function (data) {
            var ret = {};
            ["first_name", "last_name", "email_address"].forEach(function (prop) {
                ret[camelize(prop)] = data[prop];
            });
            ret.address = data.address;
            return ret;
        })
        .on("data", function (data, i) {
            count++;
        })
        .on("end", function (count) {
            if (count !== num) {
                done(new Error("Error expected " + num + " got " + count));
            } else {
                done();
            }
        })
        .on('error', function (error) {
            done(error);
        });

}

function benchmarkCsv(num, done) {
    var count = 0,
        file = path.resolve(__dirname, "./assets/" + num + ".csv");
    fs.createReadStream(file)
        .pipe(csv.parse({columns: true}))
        .pipe(csv.transform(function (data) {
            var ret = {};
            ["first_name", "last_name", "email_address"].forEach(function (prop) {
                ret[camelize(prop)] = data[prop];
            });
            ret.address = data.address;
            return ret;
        }))
        .on('data', function (data) {
            count++;
        })
        .on('end', function () {
            if (count !== num) {
                done(new Error("Error expected " + num + " got " + count));
            } else {
                done();
            }
        })
        .on('error', function (error) {
            console.log(error.message);
        });
}

function benchmark(title, num, m, done) {
    var start = new Date(), runStart = start;
    m(num, function (err) {
        if (err) {
            done(err);
        } else {
            console.log("%s: RUN(%d lines) 1 %dms", title, num, (new Date() - runStart));
            runStart = new Date();
            m(num, function (err) {
                if (err) {
                    done(err);
                } else {
                    console.log("%s: RUN(%d lines) 2 %dms", title, num, (new Date() - runStart));
                    runStart = new Date();
                    m(num, function (err) {
                        if (err) {
                            done(err);
                        } else {
                            console.log("%s: RUN(%d lines) 3 %dms", title, num, (new Date() - runStart));
                            console.log("%s: 3xAVG for %d lines %dms", title, num, (new Date() - start) / 3);
                            done();
                        }

                    });
                }
            });
        }
    });
}

function runBenchmarks(num, cb) {
    console.log("RUNNING %d.csv benchmarks", num);
    benchmark('fast-csv', num, benchmarkFastCsv, function (err) {
        if (err) {
            cb(err);
        } else {
            benchmark('csv', num, benchmarkCsv, function (err) {
                if (err) {
                    cb(err);
                } else {
                    console.log("");
                    cb();
                }
            });
        }
    });
}

module.exports = function benchmarks(cb) {
    runBenchmarks(20000, function (err) {
        if (err) {
            cb(err);
        } else {
            runBenchmarks(50000, function (err) {
                if (err) {
                    cb(err);
                } else {
                    runBenchmarks(100000, function (err) {
                        if (err) {
                            cb(err);
                        } else {
                            cb(null);
                        }
                    });
                }
            });
        }
    });
};

