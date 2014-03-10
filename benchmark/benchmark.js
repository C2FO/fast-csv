var fastCsv = require("../lib"),
    csv = require("csv"),
    path = require("path"),
    COUNT = 100000,
    TEST_FILE = path.resolve(__dirname, "./assets/" + COUNT + ".csv");


function camelize(str) {
    return str.replace(/_(.)/g, function (a, b) {
        return b.toUpperCase();
    });
}

function benchmarkFastCsv(done) {
    var count = 0;
    fastCsv
        .fromPath(TEST_FILE, {headers: true})
        .transform(function (data) {
            var ret = {};
            ["first_name", "last_name", "email_address"].forEach(function (prop) {
                ret[camelize(prop)] = data[prop];
            });
            ret.address = data.address;
            return ret;
        })
        .on("record", function () {
            count++;
        })
        .on("end", function () {
            if (count !== COUNT) {
                done(new Error("Error expected %d got %d", COUNT, count));
            } else {
                done();
            }
        })
        .on('error', function (error) {
            done(error);
        });

}

function benchmarkCsv(done) {
    var count = 0;
    csv()
        .from.path(TEST_FILE, {headers: true})
        .transform(function (data) {
            var ret = {};
            ["first_name", "last_name", "email_address"].forEach(function (prop, i) {
                ret[camelize(prop)] = data[i];
            });
            ret.address = data[3];
            return ret;
        })
        .on('record', function () {
            count++;
        })
        .on('end', function () {
            if (count !== COUNT + 1) {
                done(new Error("Error expected %d got %d", COUNT, count));
            } else {
                done();
            }
        })
        .on('error', function (error) {
            console.log(error.message);
        });
}

function benchmark(title, m, done) {
    var start = new Date(), runStart = start;
    m(function (err) {
        if (err) {
            done(err);
        } else {
            console.log("%s: RUN 1 %dms", title, (new Date() - runStart));
            runStart = new Date();
            m(function (err) {
                if (err) {
                    done(err);
                } else {
                    console.log("%s: RUN 2 %dms", title, (new Date() - runStart));
                    runStart = new Date();
                    m(function (err) {
                        if (err) {
                            done(err);
                        } else {
                            console.log("%s: RUN 3 %dms", title, (new Date() - runStart));
                            console.log("%s: 3xAVG %dms", title, (new Date() - start) / 3);
                            done();
                        }

                    });
                }
            });
        }
    });
}

benchmark('fast-csv', benchmarkFastCsv, function (err) {
    if (err) {
        console.log(err.stack);
    } else {
        benchmark('csv', benchmarkCsv, function (err) {
            if (err) {
                console.log(err.stack);
            }
        });
    }
});