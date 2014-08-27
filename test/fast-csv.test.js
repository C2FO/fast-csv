var it = require("it"),
    assert = require("assert"),
    fs = require("fs"),
    csv = require("../index"),
    path = require("path"),
    stream = require("stream");

function camelize(str) {
    return str.replace(/_(.)/g, function (a, b) {
        return b.toUpperCase();
    });
}

var expected1 = [
    {
        "first_name": "First1",
        "last_name": "Last1",
        "email_address": "email1@email.com",
        address: "1 Street St, State ST, 88888"
    },
    {
        "first_name": "First2",
        "last_name": "Last2",
        "email_address": "email2@email.com",
        address: "2 Street St, State ST, 88888"
    },
    {
        "first_name": "First3",
        "last_name": "Last3",
        "email_address": "email3@email.com",
        address: "3 Street St, State ST, 88888"
    },
    {
        "first_name": "First4",
        "last_name": "Last4",
        "email_address": "email4@email.com",
        address: "4 Street St, State ST, 88888"
    },
    {
        "first_name": "First5",
        "last_name": "Last5",
        "email_address": "email5@email.com",
        address: "5 Street St, State ST, 88888"
    },
    {
        "first_name": "First6",
        "last_name": "Last6",
        "email_address": "email6@email.com",
        address: "6 Street St, State ST, 88888"
    },
    {
        "first_name": "First7",
        "last_name": "Last7",
        "email_address": "email7@email.com",
        address: "7 Street St, State ST, 88888"
    },
    {
        "first_name": "First8",
        "last_name": "Last8",
        "email_address": "email8@email.com",
        address: "8 Street St, State ST, 88888"
    },
    {
        "first_name": "First9",
        "last_name": "Last9",
        "email_address": "email9@email.com",
        address: "9 Street St, State ST, 88888"
    }
];

var expected2 = [
    ['First1', 'Last1', 'email1@email.com', '1 Street St, State ST, 88888'],
    ['First2', 'Last2', 'email2@email.com', '2 Street St, State ST, 88888'],
    ['First3', 'Last3', 'email3@email.com', '3 Street St, State ST, 88888'],
    ['First4', 'Last4', 'email4@email.com', '4 Street St, State ST, 88888'],
    ['First5', 'Last5', 'email5@email.com', '5 Street St, State ST, 88888'],
    ['First6', 'Last6', 'email6@email.com', '6 Street St, State ST, 88888'],
    ['First7', 'Last7', 'email7@email.com', '7 Street St, State ST, 88888'],
    ['First8', 'Last8', 'email8@email.com', '8 Street St, State ST, 88888'],
    ['First9', 'Last9', 'email9@email.com', '9 Street St, State ST, 88888']
];

var expected3 = [
    {
        "first_name": "First1",
        "last_name": "Last1",
        "email_address": "email1@email.com",
        address: '1 "Street" St, State ST, 88888'
    },
    {
        "first_name": "First2",
        "last_name": "Last2",
        "email_address": "email2@email.com",
        address: '2 "Street" St, State ST, 88888'
    },
    {
        "first_name": "First3",
        "last_name": "Last3",
        "email_address": "email3@email.com",
        address: '3 "Street" St, State ST, 88888'
    },
    {
        "first_name": "First4",
        "last_name": "Last4",
        "email_address": "email4@email.com",
        address: '4 "Street" St, State ST, 88888'
    },
    {
        "first_name": "First5",
        "last_name": "Last5",
        "email_address": "email5@email.com",
        address: '5 "Street" St, State ST, 88888'
    },
    {
        "first_name": "First6",
        "last_name": "Last6",
        "email_address": "email6@email.com",
        address: '6 "Street" St, State ST, 88888'
    },
    {
        "first_name": "First7",
        "last_name": "Last7",
        "email_address": "email7@email.com",
        address: '7 "Street" St, State ST, 88888'
    },
    {
        "first_name": "First8",
        "last_name": "Last8",
        "email_address": "email8@email.com",
        address: '8 "Street" St, State ST, 88888'
    },
    {
        "first_name": "First9",
        "last_name": "Last9",
        "email_address": "email9@email.com",
        address: '9 "Street" St, State ST, 88888'
    }
];

var expected4 = [
    {"first_name": "First1", "last_name": "Last1", "email_address": "email1@email.com"},
    {"first_name": "First2", "last_name": "Last2", "email_address": "email2@email.com"},
    {"first_name": "First3", "last_name": "Last3", "email_address": "email3@email.com"},
    {"first_name": "First4", "last_name": "Last4", "email_address": "email4@email.com"},
    {"first_name": "First5", "last_name": "Last5", "email_address": "email5@email.com"},
    {"first_name": "First6", "last_name": "Last6", "email_address": "email6@email.com"},
    {"first_name": "First7", "last_name": "Last7", "email_address": "email7@email.com"},
    {"first_name": "First8", "last_name": "Last8", "email_address": "email8@email.com"},
    {"first_name": "First9", "last_name": "Last9", "email_address": "email9@email.com"}
];

var expectedValid = [
    {"first_name": "First1", "last_name": "Last1", "email_address": "email1@email.com"},
    {"first_name": "First3", "last_name": "Last3", "email_address": "email3@email.com"},
    {"first_name": "First5", "last_name": "Last5", "email_address": "email5@email.com"},
    {"first_name": "First7", "last_name": "Last7", "email_address": "email7@email.com"},
    {"first_name": "First9", "last_name": "Last9", "email_address": "email9@email.com"}
];

var expectedInvalid = [
    {"first_name": "First2", "last_name": "Last2", "email_address": "email2@email.com"},
    {"first_name": "First4", "last_name": "Last4", "email_address": "email4@email.com"},
    {"first_name": "First6", "last_name": "Last6", "email_address": "email6@email.com"},
    {"first_name": "First8", "last_name": "Last8", "email_address": "email8@email.com"}
];

var expectedCamelCase = [
    {firstName: "First1", lastName: "Last1", emailAddress: "email1@email.com"},
    {firstName: "First2", lastName: "Last2", emailAddress: "email2@email.com"},
    {firstName: "First3", lastName: "Last3", emailAddress: "email3@email.com"},
    {firstName: "First4", lastName: "Last4", emailAddress: "email4@email.com"},
    {firstName: "First5", lastName: "Last5", emailAddress: "email5@email.com"},
    {firstName: "First6", lastName: "Last6", emailAddress: "email6@email.com"},
    {firstName: "First7", lastName: "Last7", emailAddress: "email7@email.com"},
    {firstName: "First8", lastName: "Last8", emailAddress: "email8@email.com"},
    {firstName: "First9", lastName: "Last9", emailAddress: "email9@email.com"}
];

var expected7 = [
    {"first_name": "First1", "last_name": "Last1", "email_address": "email1@email.com", address: ""},
    {"first_name": "First2", "last_name": "Last2", "email_address": "email2@email.com", address: ""},
    {"first_name": "First3", "last_name": "Last3", "email_address": "email3@email.com", address: ""},
    {"first_name": "First4", "last_name": "Last4", "email_address": "email4@email.com", address: ""},
    {"first_name": "First5", "last_name": "Last5", "email_address": "email5@email.com", address: ""},
    {"first_name": "First6", "last_name": "Last6", "email_address": "email6@email.com", address: ""},
    {"first_name": "First7", "last_name": "Last7", "email_address": "email7@email.com", address: ""},
    {"first_name": "First8", "last_name": "Last8", "email_address": "email8@email.com", address: ""},
    {"first_name": "First9", "last_name": "Last9", "email_address": "email9@email.com", address: ""}
];

var expected8 = [
    {"first_name": "First1", "last_name": "Last1", "email_address": "email1@email.com"},
    {"first_name": "", "last_name": "Last4", "email_address": "email4@email.com"},
    {"first_name": "First5", "last_name": "", "email_address": "email5@email.com"},
    {"first_name": "First7", "last_name": "Last7", "email_address": ""}
];

var expected9 = [
    {
        "first_name": "First'1",
        "last_name": "Last1",
        "email_address": "email1@email.com",
        address: "1 Street St, State ST, 88888"
    },
    {
        "first_name": "First'2",
        "last_name": "Last2",
        "email_address": "email2@email.com",
        address: "2 Street St, State ST, 88888"
    },
    {
        "first_name": "First'3",
        "last_name": "Last3",
        "email_address": "email3@email.com",
        address: "3 Street St, State ST, 88888"
    },
    {
        "first_name": "First'4",
        "last_name": "Last4",
        "email_address": "email4@email.com",
        address: "4 Street St, State ST, 88888"
    },
    {
        "first_name": "First'5",
        "last_name": "Last5",
        "email_address": "email5@email.com",
        address: "5 Street St, State ST, 88888"
    },
    {
        "first_name": "First'6",
        "last_name": "Last6",
        "email_address": "email6@email.com",
        address: "6 Street St, State ST, 88888"
    },
    {
        "first_name": "First'7",
        "last_name": "Last7",
        "email_address": "email7@email.com",
        address: "7 Street St, State ST, 88888"
    },
    {
        "first_name": "First'8",
        "last_name": "Last8",
        "email_address": "email8@email.com",
        address: "8 Street St, State ST, 88888"
    },
    {
        "first_name": "First'9",
        "last_name": "Last9",
        "email_address": "email9@email.com",
        address: "9 Street St, State ST, 88888"
    }
];

var expected10 = [
    {
        "first_name": "First\"1",
        "last_name": "Last1",
        "email_address": "email1@email.com",
        address: "1 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"2",
        "last_name": "Last2",
        "email_address": "email2@email.com",
        address: "2 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"3",
        "last_name": "Last3",
        "email_address": "email3@email.com",
        address: "3 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"4",
        "last_name": "Last4",
        "email_address": "email4@email.com",
        address: "4 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"5",
        "last_name": "Last5",
        "email_address": "email5@email.com",
        address: "5 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"6",
        "last_name": "Last6",
        "email_address": "email6@email.com",
        address: "6 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"7",
        "last_name": "Last7",
        "email_address": "email7@email.com",
        address: "7 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"8",
        "last_name": "Last8",
        "email_address": "email8@email.com",
        address: "8 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"9",
        "last_name": "Last9",
        "email_address": "email9@email.com",
        address: "9 Street St, State ST, 88888"
    }
];

var expected14 = [
    {
        "first_name": "First1",
        "last_name": "Last1",
        "email_address": "email1@email.com",
        address: "1 Street St, State ST, 88888"
    },
    {
        "first_name": "First2",
        "last_name": "Last2",
        "email_address": "email2@email.com",
        address: "2 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"3",
        "last_name": "Last3",
        "email_address": "email3@email.com",
        address: "3 Street St, State ST, 88888"
    },
    {
        "first_name": "First\"4",
        "last_name": "Last4",
        "email_address": "email4@email.com",
        address: "4 Street St, State ST, 88888"
    },
    {
        "first_name": "First'5",
        "last_name": "Last5",
        "email_address": "email5@email.com",
        address: "5 Street St, State ST, 88888"
    },
    {
        "first_name": "First'6",
        "last_name": "Last6",
        "email_address": "email6@email.com",
        address: "6 Street St, State ST, 88888"
    },
    {
        "first_name": "First'7",
        "last_name": "Last7",
        "email_address": "email7@email.com",
        address: "7 Street St, State ST, 88888"
    }
];

var expected21 = [
    {
        "first_name": "First\n1",
        "last_name": "Last\n1",
        "email_address": "email1@email.com",
        address: "1 Street St,\nState ST, 88888"
    },
    {
        "first_name": "First\n2",
        "last_name": "Last\n2",
        "email_address": "email2@email.com",
        address: "2 Street St,\nState ST, 88888"
    }
];

var expected23 = [
    {"first_name": "First1", "last_name": "Last1", "email_address": "email1@email.com"},
    {"first_name": "First2", "last_name": "Last2", "email_address": "email2@email.com"},
    {"first_name": "First3", "last_name": "Last3", "email_address": "email3@email.com"}
];

it.describe("fast-csv", function (it) {

    it.timeout(60000);

    it.should("parse a csv without quotes or escapes", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
            .on("record", function (data, index) {
                actual[index] = data;
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected4);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("emit a readable event ", function (next) {
        var actual = [],
            stream = csv.fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true}).on("error", next)
                .on("end", function (count) {
                    assert.deepEqual(actual, expected4);
                    assert.equal(count, actual.length);
                    next();
                }),
            index = 0;
        stream.on("readable", function (data) {
            while ((data = stream.read()) !== null) {
                actual[index++] = data;
            }
        });

    });


    it.should("emit data as a buffer if objectMode is false", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true, objectMode: false})
            .on("data", function (data) {
                actual.push(JSON.parse(data + ""));
            }).
            on("end", function () {
                assert.deepEqual(actual, expected4);
                assert.equal(9, actual.length);
                next();
            });
    });

    it.should("emit data as an object if objectMode is true", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true, objectMode: true})
            .on("data", function (data) {
                actual.push(data);
            })
            .on("end", function (count) {
                assert.deepEqual(actual, expected4);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("emit data as an object if objectMode is not specified", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true, objectMode: true})
            .on("data", function (data) {
                actual.push(data);
            })
            .on("end", function (count) {
                assert.deepEqual(actual, expected4);
                assert.equal(count, actual.length);
                next();
            });
    });


    it.should("allow piping from a stream", function (next) {
        var actual = [];
        var stream = csv({headers: true})
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected4);
                assert.equal(count, actual.length);
                next();
            });
        fs.createReadStream(path.resolve(__dirname, "./assets/test4.csv")).pipe(stream);
    });

    it.should("accept a csv string", function (next) {
        var actual = [];
        var data = fs.readFileSync(path.resolve(__dirname, "./assets/test4.csv"), {encoding: "utf8"});
        csv
            .fromString(data, {headers: true})
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected4);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("parse a csv with \" escapes", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test1.csv"), {headers: true})
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected1);
                assert.equal(count, actual.length);
                next();
            });
    });
    it.should("parse a csv with without headers", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test2.csv"))
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected2);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("parse a csv with ' escapes", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test3.csv"), {headers: true, quote: "'"})
            .on("record", function (data, index) {
                actual[index] = data;
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected3);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("allow specifying of columns", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test2.csv"), {headers: ["first_name", "last_name", "email_address", "address"]})
            .on("record", function (data, index) {
                actual[index] = data;
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected1);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.describe(".validate", function (it) {

        it.should("allow validation of rows", function (next) {
            var actual = [], invalid = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .validate(function (data) {
                    return parseInt(data["first_name"].replace(/^First/, ""), 10) % 2;
                })
                .on("record", function (data) {
                    actual.push(data);
                })
                .on("data-invalid", function (data) {
                    invalid.push(data);
                })
                .on("error", next)
                .on("end", function (count) {
                    assert.deepEqual(invalid, expectedInvalid);
                    assert.deepEqual(actual, expectedValid);
                    assert.equal(count, actual.length);
                    next();
                });
        });

        it.should("allow async validation of rows", function (next) {
            var actual = [], invalid = [], validating = false;
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .validate(function (data, next) {
                    validating = true;
                    setImmediate(function () {
                        validating = false;
                        next(null, parseInt(data["first_name"].replace(/^First/, ""), 10) % 2);
                    });
                })
                .on("record", function (data) {
                    assert.isFalse(validating);
                    actual.push(data);
                })
                .on("data-invalid", function (data) {
                    invalid.push(data);
                })
                .on("error", next)
                .on("end", function (count) {
                    assert.deepEqual(invalid, expectedInvalid);
                    assert.deepEqual(actual, expectedValid);
                    assert.equal(count, actual.length);
                    next();
                });
        });

        it.should("propagate errors from async validation", function (next) {
            var actual = [], invalid = [], index = -1;
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .validate(function (data, next) {
                    setImmediate(function () {
                        if (++index === 8) {
                            next(new Error("Validation ERROR!!!!"));
                        } else {
                            next(null, true);
                        }
                    });
                })
                .on("record", function (data, index) {
                    actual.push(data);
                })
                .on("data-invalid", function (data, index) {
                    invalid.push(data);
                })
                .on("error", function (err) {
                    assert.equal(err.message, "Validation ERROR!!!!");
                    next();
                })
                .on("end", function (count) {
                    next(new Error("Validation error not propagated"));
                });
        });

        it.should("propagate async errors at the beginning", function (next) {
            var actual = [], invalid = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .validate(function (data, next) {
                    next(new Error("Validation ERROR!!!!"));
                })
                .on("record", function (data) {
                    actual.push(data);
                })
                .on("data-invalid", function (data) {
                    invalid.push(data);
                })
                .on("error", function (err) {
                    assert.equal(err.message, "Validation ERROR!!!!");
                    next();
                })
                .on("end", function (count) {
                    next(new Error("Validation error not propagated"));
                });
        });

        it.should("propagate thrown errors", function (next) {
            var actual = [], invalid = [], index = -1;
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .validate(function (data, next) {
                    if (++index === 8) {
                        throw new Error("Validation ERROR!!!!");
                    } else {
                        setImmediate(function () {
                            next(null, true);
                        });
                    }
                })
                .on("record", function (data) {
                    actual.push(data);
                })
                .on("data-invalid", function (data) {
                    invalid.push(data);
                })
                .on("error", function (err) {
                    assert.equal(err.message, "Validation ERROR!!!!");
                    next();
                })
                .on("end", function (count) {
                    next(new Error("Validation error not propagated"));
                });
        });

        it.should("propagate thrown errors at the beginning", function (next) {
            var actual = [], invalid = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .validate(function () {
                    throw new Error("Validation ERROR!!!!");
                })
                .on("record", function (data) {
                    actual.push(data);
                })
                .on("data-invalid", function (data) {
                    invalid.push(data);
                })
                .on("error", function (err) {
                    assert.equal(err.message, "Validation ERROR!!!!");
                    next();
                })
                .on("end", function (count) {
                    next(new Error("Validation error not propagated"));
                });
        });
    });

    it.describe(".transform", function (it) {

        it.should("allow transforming of data", function (next) {
            var actual = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .transform(function (data) {
                    var ret = {};
                    ["first_name", "last_name", "email_address"].forEach(function (prop) {
                        ret[camelize(prop)] = data[prop];
                    });
                    return ret;
                })
                .on("record", function (data, index) {
                    actual[index] = data;
                })
                .on("error", next)
                .on("end", function (count) {
                    assert.deepEqual(actual, expectedCamelCase);
                    assert.equal(count, actual.length);
                    next();
                });
        });

        it.should("async transformation of data", function (next) {
            var actual = [], transforming = false;
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .transform(function (data, next) {
                    transforming = true;
                    setImmediate(function () {
                        var ret = {};
                        ["first_name", "last_name", "email_address"].forEach(function (prop) {
                            ret[camelize(prop)] = data[prop];
                        });
                        transforming = false;
                        next(null, ret);
                    });
                })
                .on("record", function (data, index) {
                    assert.isFalse(transforming)
                    actual[index] = data;
                })
                .on("error", next)
                .on("end", function (count) {
                    assert.deepEqual(actual, expectedCamelCase);
                    assert.equal(count, actual.length);
                    next();
                });
        });

        it.should("propogate errors when transformation of data", function (next) {
            var actual = [], index = -1;
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .transform(function (data, next) {
                    setImmediate(function () {
                        if (++index === 8) {
                            next(new Error("transformation ERROR!!!!"));
                        } else {
                            var ret = {};
                            ["first_name", "last_name", "email_address"].forEach(function (prop) {
                                ret[camelize(prop)] = data[prop];
                            });
                            next(null, ret);
                        }
                    });
                })
                .on("record", function (data, index) {
                    actual[index] = data;
                })
                .on("error", function (err) {
                    assert.equal(err.message, "transformation ERROR!!!!");
                    next();
                })
                .on("end", function (count) {
                    next(new Error("Transformation error not propagated"));
                });
        });

        it.should("propogate errors when transformation of data at the beginning", function (next) {
            var actual = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .transform(function (data, next) {
                    setImmediate(function () {
                        next(new Error("transformation ERROR!!!!"));
                    });
                })
                .on("record", function (data, index) {
                    actual[index] = data;
                })
                .on("error", function (err) {
                    assert.equal(err.message, "transformation ERROR!!!!");
                    next();
                })
                .on("end", function (count) {
                    next(new Error("Transformation error not propagated"));
                });
        });


        it.should("propagate thrown errors at the end", function (next) {
            var actual = [], invalid = [], index = -1;
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .transform(function (data, next) {
                    if (++index === 8) {
                        throw new Error("transformation ERROR!!!!");
                    } else {
                        setImmediate(function () {
                            next(null, data);
                        });
                    }
                })
                .on("record", function (data) {
                    actual.push(data);
                })
                .on("data-invalid", function (data) {
                    invalid.push(data);
                })
                .on("error", function (err) {
                    assert.equal(err.message, "transformation ERROR!!!!");
                    next();
                })
                .on("end", function (count) {
                    next(new Error("transformation error not propagated"));
                });
        });

        it.should("propagate thrown errors at the beginning", function (next) {
            var actual = [], invalid = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .transform(function () {
                    throw new Error("transformation ERROR!!!!");
                })
                .on("record", function (data) {
                    actual.push(data);
                })
                .on("data-invalid", function (data) {
                    invalid.push(data);
                })
                .on("error", function (err) {
                    assert.equal(err.message, "transformation ERROR!!!!");
                    next();
                })
                .on("end", function (count) {
                    next(new Error("transformation error not propagated"));
                });
        });
    });

    it.should("accept a stream", function (next) {
        var actual = [];
        csv
            .fromStream(fs.createReadStream(path.resolve(__dirname, "./assets/test4.csv")), {headers: true})
            .on("record", function (data, index) {
                actual[index] = data;
            })
            .on("error", next)
            .on("end", function () {
                assert.deepEqual(actual, expected4);
                next();
            });
    });

    it.should("emit an error for invalid rows", function (next) {
        var actual = [], parseErrorCalled = false;
        csv
            .fromPath(path.resolve(__dirname, "./assets/test6.csv"), {headers: true})
            .on("record", function (data) {
                actual.push(data);
            })
            .on("error", function (err) {
                next();
            })
            .on("end", function () {
                assert.deepEqual(actual, expected1.slice(1));
                assert.isTrue(parseErrorCalled);
                next(new Error("unexpected end call"));
            })
            .on("parse-error", function (error) {
                parseErrorCalled = true;
                assert.equal(error.message, 'Invalid row "First1"a   ", Last1 ,email1@email.com,"1 Street St, State ST, 88888"');
            });
    });

    it.should("handle a trailing comma", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test7.csv"), {headers: true})
            .on("record", function (data, index) {
                actual.push(data);
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected7);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("skip valid, but empty rows with ignoreEmpty option", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test8.csv"), {headers: true, ignoreEmpty: true})
            .on("record", function (data, index) {
                actual.push(data);
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected8);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("handle single quotes inside of double quotes", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test9.csv"), {headers: true})
            .on("record", function (data) {
                actual.push(data);
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected9);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("handle double quotes inside of single quotes", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test10.csv"), {headers: true, quote: "'"})
            .on("record", function (data) {
                actual.push(data);
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected10);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("handle escaped double quotes inside of double quotes", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test11.csv"), {headers: true, escape: "\\"})
            .on("record", function (data) {
                actual.push(data);
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected10);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("handle escaped single quotes inside of single quotes", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test12.csv"), {headers: true, quote: "'", escape: "\\"})
            .on("record", function (data) {
                actual.push(data);
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected9);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("discard extra columns that do not map to a header with discardUnmappedColumns option", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test23.csv"), {headers: true, discardUnmappedColumns: true})
            .on("record", function (data, index) {
                actual.push(data);
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected23);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.describe("alternate delimiters", function (it) {
        it.should("support tab delimiters", function (next) {
            var actual = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test14.txt"), {headers: true, delimiter: "\t"})
                .on("record", function (data, index) {
                    actual[index] = data;
                })
                .on("error", next)
                .on("end", function (count) {
                    assert.deepEqual(actual, expected14);
                    assert.equal(count, actual.length);
                    next();
                });
        });

        it.should("support pipe delimiters", function (next) {
            var actual = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test15.txt"), {headers: true, delimiter: "|"})
                .on("record", function (data, index) {
                    actual[index] = data;
                })
                .on("error", next)
                .on("end", function (count) {
                    assert.deepEqual(actual, expected14);
                    assert.equal(count, actual.length);
                    next();
                });
        });

        it.should("support semicolon delimiters", function (next) {
            var actual = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test16.txt"), {headers: true, delimiter: ";"})
                .on("record", function (data, index) {
                    actual[index] = data;
                })
                .on("error", next)
                .on("end", function (count) {
                    assert.deepEqual(actual, expected14);
                    assert.equal(count, actual.length);
                    next();
                });
        });
    });

    it.should("ignore leading white space in front of a quoted value", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test17.csv"), {headers: true})
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected1);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("accept a ltrim parameter", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test18.csv"), {ltrim: true, trim: false, headers: true})
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected1);
                assert.equal(count, actual.length);
                next();
            });
    });


    it.should("accept a rtrim parameter", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test19.csv"), {rtrim: true, trim: false, headers: true})
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected1);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("accept a trim parameter", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test20.csv"), {trim: true, headers: true})
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected1);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("handle CSVs with new lines", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test21.csv"), {headers: true, ignoreEmpty: true})
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected21);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("handle CSVs with comments", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test24.csv"), {headers: true, comment: "#"})
            .on("record", function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected1);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.describe("pause/resume", function (it) {

        it.should("support pausing a stream", function (next) {
            var actual = [], paused = false;
            var stream = csv
                .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
                .on("record", function (data, index) {
                    assert.isFalse(paused);
                    actual[index] = data;
                    paused = true;
                    stream.pause();
                    setTimeout(function () {
                        assert.isTrue(paused);
                        paused = false;
                        stream.resume();
                    }, 100);
                })
                .on("error", next)
                .on("end", function (count) {
                    assert.deepEqual(actual, expected4);
                    assert.equal(count, actual.length);
                    next();
                });
        });
    });


    it.should("throw an error if an invalid path or stream is passed in", function () {
        assert.throws(function () {
            csv().fromString(1);
        });
    });

    it.should("throw an error if a validate is not called with a function", function () {
        assert.throws(function () {
            csv({headers: true}).fromPath(path.resolve(__dirname, "./assets/test7.csv")).validate("hello");
        });
    });

    it.should("throw an error if a transform is not called with a function", function () {
        assert.throws(function () {
            csv({headers: true}).fromPath(path.resolve(__dirname, "./assets/test7.csv")).transform("hello");
        });
    });

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