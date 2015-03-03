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

var expected25 = [
    {"first_name": "First1", "last_name": "Last1", "email_address": "email1@email.com", "extra": "Extra1"},
    {"first_name": "First3", "last_name": "Last3", "email_address": "email3@email.com", "extra": "Extra2"}
];

var expected25_invalid = [ 'First2', 'Last2', 'email2@email.com' ];

it.describe("fast-csv parsing", function (it) {

    it.timeout(60000);

    it.should("parse a csv without quotes or escapes", function (next) {
        var actual = [];
        csv
            .fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true})
            .on("data", function (data) {
                actual.push(data);
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
            .on("data", function (data, index) {
                actual.push(data);
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
            .on("data", function (data, index) {
                actual.push(data);
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
            .on("data", function (data, index) {
                actual.push(data);
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
            .on("data", function (data, index) {
                actual.push(data);
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
            .on("data", function (data, index) {
                actual.push(data);
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
            .on("data", function (data, index) {
                actual.push(data);
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
                .on("data", function (data) {
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
                .on("data", function (data) {
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
                .on("data", function (data, index) {
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
                .on("data", function (data) {
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
                .on("data", function (data) {
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
                .on("data", function (data) {
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
                .on("data", function (data, index) {
                    actual.push(data);
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
                .on("data", function (data) {
                    assert.isFalse(transforming)
                    actual.push(data);
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
                .on("data", function (data) {
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
                .on("data", function (data) {
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
                .on("data", function (data) {
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
                .on("data", function (data) {
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
            .on("data", function (data) {
                actual.push(data);
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
            .on("data", function (data) {
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
            .on("data", function (data) {
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
            .on("data", function (data) {
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
            .on("data", function (data) {
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
            .on("data", function (data) {
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
            .on("data", function (data) {
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
            .on("data", function (data) {
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
            .on("data", function (data) {
                actual.push(data);
            })
            .on("error", next)
            .on("end", function (count) {
                assert.deepEqual(actual, expected23);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.should("report missing columns that do not exist but have a header with strictColumnHandling option", function (next) {
        var actual = [];
        var reachedInvalid = false;
        csv
            .fromPath(path.resolve(__dirname, "./assets/test25.csv"), {headers: true, strictColumnHandling: true})
            .on("data", function (data) {
                actual.push(data);
            })
            .on("data-invalid", function(actual) {
                assert.deepEqual(actual, expected25_invalid);
                reachedInvalid = true;
            })
            .on("error", next)
            .on("end", function (count) {
                assert.equal(true, reachedInvalid);
                assert.deepEqual(actual, expected25);
                assert.equal(count, actual.length);
                next();
            });
    });

    it.describe("alternate delimiters", function (it) {
        it.should("support tab delimiters", function (next) {
            var actual = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/test14.txt"), {headers: true, delimiter: "\t"})
                .on("data", function (data) {
                    actual.push(data);
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
                .on("data", function (data) {
                    actual.push(data);
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
                .on("data", function (data) {
                    actual.push(data);
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
            .on("data", function (data) {
                actual.push(data);
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
            .on("data", function (data) {
                actual.push(data);
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
            .on("data", function (data) {
                actual.push(data);
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
            .on("data", function (data) {
                actual.push(data);
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
            .on("data", function (data) {
                actual.push(data);
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
            .on("data", function (data) {
                actual.push(data);
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
            var stream = csv.fromPath(path.resolve(__dirname, "./assets/test4.csv"), {headers: true});
                stream.on("data", function (data) {
                    assert.isFalse(paused);
                    actual.push(data);
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

});