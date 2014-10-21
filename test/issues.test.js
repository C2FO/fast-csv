var it = require("it"),
    assert = require("assert"),
    fs = require("fs"),
    csv = require("../index"),
    path = require("path"),
    stream = require("stream");


it.describe("github issues", function (it) {

    it.timeout(60000);

    it.describe("#68", function (it) {

        it.should("handle parse errors properly", function (next) {
            var actual = [];
            csv
                .fromPath(path.resolve(__dirname, "./assets/issue68.csv"), {headers: true, delimiter: "\t"})
                .on("error", function (err) {
                    assert.equal(err.message, "End error");
                    next();
                })
                .on("data", function (data) {
                    actual.push(data);
                })
                .on("end", function (count) {
                    assert.equal(count, 20000);
                    throw new Error("End error");
                });
        });
    });
});