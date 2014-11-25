var it = require("it"),
    assert = require("assert"),
    es = require("event-stream"),
    csv = require("../index");

it.describe("formatting headers", function (it) {
    it.should("be possible by giving an ordered array", function (next) {
        var input = es.readArray([{first: "1", second: "2"}]);
        var csvStream = csv.createWriteStream({headers: ["second", "first"]});
        input.pipe(csvStream).pipe(es.writeArray(function (err, array) {
            assert.deepEqual(array.join(""), "second,first\n2,1");
            next();
        }));
    });
});
