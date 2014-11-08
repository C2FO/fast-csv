var it = require("it"),
    assert = require("assert"),
    parser = require("../lib/parser/parser");

it.describe("fast-csv parser", function (it) {

    it.describe("with \\n", function (it) {

        it.describe("unescaped data", function (it) {

            it.should("parse a block of CSV text", function () {
                var data = "first_name,last_name,email_address\nFirst1,Last1,email1@email.com";
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First1", "Last1", "email1@email.com"]
                    ]
                });
            });

            it.should("return the rest of the line if there is more data", function () {
                var data = "first_name,last_name,email_address\nFirst1,Last1,email1@email.com";
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, true), {
                    "line": "First1,Last1,email1@email.com",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });

            it.should("accept new data and return the result", function () {
                var data = "first_name,last_name,email_address\nFirst1,Last1,email1@email.com,";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "First1,Last1,email1@email.com,",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
                assert.deepEqual(myParser(parsedData.line + "\nFirst2,Last2,email2@email.com", false), {
                    "line": "", "rows": [
                        ["First1", "Last1", "email1@email.com"],
                        ["First2", "Last2", "email2@email.com"]
                    ]
                });
            });

            it.should("not parse a row if a new line is not found and there is more data", function () {
                var data = "first_name,last_name,email_address";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "first_name,last_name,email_address",
                    "rows": []
                });
            });

            it.should("not parse a row if there is a trailing delimiter and there is more data", function () {
                var data = "first_name,last_name,email_address,";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "first_name,last_name,email_address,",
                    "rows": []
                });
            });

            it.should("parse a row if a new line is found and there is more data", function () {
                var data = "first_name,last_name,email_address\n";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });

        });

        it.describe("escaped values", function (it) {

            it.should("parse a block of CSV text", function () {
                var data = 'first_name,last_name,email_address\n"First,1","Last,1","email1@email.com"';
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First,1", "Last,1", "email1@email.com"]
                    ]
                });
            });

            it.should("parse a block of CSV text with escaped escaped char", function () {
                var data = 'first_name,last_name,email_address\n"First,""1""","Last,""1""","email1@email.com"';
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First,\"1\"", "Last,\"1\"", "email1@email.com"]
                    ]
                });
            });

            it.should("parse a block of CSV text with alternate escape char", function () {
                var data = 'first_name,last_name,email_address\n"First,\\"1\\"","Last,\\"1\\"","email1@email.com"';
                var myParser = parser({delimiter: ",", escape: "\\"});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First,\"1\"", "Last,\"1\"", "email1@email.com"]
                    ]
                });
            });

            it.should("return the rest of the line if a complete value is not found", function () {
                var data = 'first_name,last_name,email_address\n"First,""1""","Last,""1""","email1@email.com';
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, true), {
                    "line": '"First,""1""","Last,""1""","email1@email.com',
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });

            it.should("accept more data appended to the returned line with escaped values", function () {
                var data = 'first_name,last_name,email_address\n"First,""1""","Last,""1""","email1@email.com';
                var myParser = parser({delimiter: ","}),
                    parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"First,""1""","Last,""1""","email1@email.com',
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
                assert.deepEqual(myParser(parsedData.line + '"\n"First,""2""","Last,""2""","email2@email.com"', false), {
                    line: "",
                    rows: [
                        ["First,\"1\"", "Last,\"1\"", "email1@email.com"],
                        ["First,\"2\"", "Last,\"2\"", "email2@email.com"]
                    ]
                });
            });

            it.should("throw an error if there is not more data and there is an invalid escape sequence", function () {
                var data = 'first_name,last_name,email_address\n"First,""1""","Last,""1""","email1@email.com';
                var myParser = parser({delimiter: ","}),
                    parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"First,""1""","Last,""1""","email1@email.com',
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
                assert.throws(function () {
                    assert.deepEqual(myParser(parsedData.line + '\n"First,"",2""","Last""2""","email2@email.com"', false), {
                        line: "",
                        rows: [
                            ["First,\"1\"", "Last,\"1\"", "email1@email.com"],
                            ["First,\"2\"", "Last,\"2\"", "email2@email.com"]
                        ]
                    });
                }, Error, ' Parse Error: expected: \'"\' got: \'F\'. at \'First,""2""","Last""2""","email2@email.com"');
            });

            it.should("handle empty values properly", function () {
                var data = '"","",""\n,Last4,email4@email.com';
                var myParser = parser({delimiter: ","}),
                    parsedData = myParser(data, false);
                assert.deepEqual(parsedData, {
                    "line": "", "rows": [
                        ["", "", ""],
                        ["", "Last4", "email4@email.com"]
                    ]
                });
            });

            it.should("not parse a row if a new line is not found and there is more data", function () {
                var data = '"first_name","last_name","email_address"';
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"first_name","last_name","email_address"',
                    "rows": []
                });
            });

            it.should("not parse a row if there is a trailing delimiter and there is more data", function () {
                var data = '"first_name","last_name","email_address",';
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"first_name","last_name","email_address",',
                    "rows": []
                });
            });

            it.should("parse a row if a new line is found and there is more data", function () {
                var data = '"first_name","last_name","email_address"\n';
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });
        });

        it.describe("null quote", function (it) {
            it("should ignore escaping if quote is null", function () {
                var data = 'first_name,last_name,email_address\n"First1","Last1","email1@email.com"';
                var myParser = parser({delimiter: ",", quote: null});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ['"First1"', '"Last1"', '"email1@email.com"']
                    ]
                });
            });
        });
    });

    it.describe("with \\r", function (it) {

        it.describe("unescaped data", function (it) {

            it.should("parse a block of CSV text", function () {
                var data = "first_name,last_name,email_address\rFirst1,Last1,email1@email.com";
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First1", "Last1", "email1@email.com"]
                    ]
                });
            });

            it.should("return the rest of the line if there is more data", function () {
                var data = "first_name,last_name,email_address\rFirst1,Last1,email1@email.com";
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, true), {
                    "line": "First1,Last1,email1@email.com",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });

            it.should("accept new data and return the result", function () {
                var data = "first_name,last_name,email_address\rFirst1,Last1,email1@email.com,";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "First1,Last1,email1@email.com,",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
                assert.deepEqual(myParser(parsedData.line + "\rFirst2,Last2,email2@email.com", false), {
                    "line": "", "rows": [
                        ["First1", "Last1", "email1@email.com"],
                        ["First2", "Last2", "email2@email.com"]
                    ]
                });
            });

            it.should("not parse a row if a new line is not found and there is more data", function () {
                var data = "first_name,last_name,email_address";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "first_name,last_name,email_address",
                    "rows": []
                });
            });

            it.should("not parse a row if there is a trailing delimiter and there is more data", function () {
                var data = "first_name,last_name,email_address,";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "first_name,last_name,email_address,",
                    "rows": []
                });
            });

            it.should("parse a row if a new line is found and there is more data", function () {
                var data = "first_name,last_name,email_address\r";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });

        });

        it.describe("escaped values", function (it) {

            it.should("parse a block of CSV text", function () {
                var data = 'first_name,last_name,email_address\r"First,1","Last,1","email1@email.com"';
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First,1", "Last,1", "email1@email.com"]
                    ]
                });
            });

            it.should("parse a block of CSV text with escaped escaped char", function () {
                var data = 'first_name,last_name,email_address\r"First,""1""","Last,""1""","email1@email.com"';
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First,\"1\"", "Last,\"1\"", "email1@email.com"]
                    ]
                });
            });

            it.should("parse a block of CSV text with alternate escape char", function () {
                var data = 'first_name,last_name,email_address\r"First,\\"1\\"","Last,\\"1\\"","email1@email.com"';
                var myParser = parser({delimiter: ",", escape: "\\"});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First,\"1\"", "Last,\"1\"", "email1@email.com"]
                    ]
                });
            });

            it.should("return the rest of the line if a complete value is not found", function () {
                var data = 'first_name,last_name,email_address\r"First,""1""","Last,""1""","email1@email.com';
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, true), {
                    "line": '"First,""1""","Last,""1""","email1@email.com',
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });

            it.should("accept more data appended to the returned line with escaped values", function () {
                var data = 'first_name,last_name,email_address\r"First,""1""","Last,""1""","email1@email.com';
                var myParser = parser({delimiter: ","}),
                    parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"First,""1""","Last,""1""","email1@email.com',
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
                assert.deepEqual(myParser(parsedData.line + '"\r"First,""2""","Last,""2""","email2@email.com"', false), {
                    line: "",
                    rows: [
                        ["First,\"1\"", "Last,\"1\"", "email1@email.com"],
                        ["First,\"2\"", "Last,\"2\"", "email2@email.com"]
                    ]
                });
            });

            it.should("throw an error if there is not more data and there is an invalid escape sequence", function () {
                var data = 'first_name,last_name,email_address\r"First,""1""","Last,""1""","email1@email.com';
                var myParser = parser({delimiter: ","}),
                    parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"First,""1""","Last,""1""","email1@email.com',
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
                assert.throws(function () {
                    assert.deepEqual(myParser(parsedData.line + '\r"First,"",2""","Last""2""","email2@email.com"', false), {
                        line: "",
                        rows: [
                            ["First,\"1\"", "Last,\"1\"", "email1@email.com"],
                            ["First,\"2\"", "Last,\"2\"", "email2@email.com"]
                        ]
                    });
                }, Error, ' Parse Error: expected: \'"\' got: \'F\'. at \'First,""2""","Last""2""","email2@email.com"');
            });

            it.should("handle empty values properly", function () {
                var data = '"","",""\r,Last4,email4@email.com';
                var myParser = parser({delimiter: ","}),
                    parsedData = myParser(data, false);
                assert.deepEqual(parsedData, {
                    "line": "", "rows": [
                        ["", "", ""],
                        ["", "Last4", "email4@email.com"]
                    ]
                });
            });

            it.should("not parse a row if a new line is not found and there is more data", function () {
                var data = '"first_name","last_name","email_address"';
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"first_name","last_name","email_address"',
                    "rows": []
                });
            });

            it.should("not parse a row if there is a trailing delimiter and there is more data", function () {
                var data = '"first_name","last_name","email_address",';
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"first_name","last_name","email_address",',
                    "rows": []
                });
            });

            it.should("parse a row if a new line is found and there is more data", function () {
                var data = '"first_name","last_name","email_address"\r';
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });
        });

        it.describe("null quote", function (it) {
            it("should ignore escaping if quote is null", function () {
                var data = 'first_name,last_name,email_address\r"First1","Last1","email1@email.com"';
                var myParser = parser({delimiter: ",", quote: null});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ['"First1"', '"Last1"', '"email1@email.com"']
                    ]
                });
            });
        });

    });

    it.describe("with \\r\\n", function (it) {

        it.describe("unescaped data", function (it) {

            it.should("parse a block of CSV text", function () {
                var data = "first_name,last_name,email_address\r\nFirst1,Last1,email1@email.com";
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First1", "Last1", "email1@email.com"]
                    ]
                });
            });

            it.should("return the rest of the line if there is more data", function () {
                var data = "first_name,last_name,email_address\r\nFirst1,Last1,email1@email.com";
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, true), {
                    "line": "First1,Last1,email1@email.com",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });

            it.should("accept new data and return the result", function () {
                var data = "first_name,last_name,email_address\r\nFirst1,Last1,email1@email.com,";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "First1,Last1,email1@email.com,",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
                assert.deepEqual(myParser(parsedData.line + "\r\nFirst2,Last2,email2@email.com", false), {
                    "line": "", "rows": [
                        ["First1", "Last1", "email1@email.com"],
                        ["First2", "Last2", "email2@email.com"]
                    ]
                });
            });

            it.should("not parse a row if a new line is not found and there is more data", function () {
                var data = "first_name,last_name,email_address";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "first_name,last_name,email_address",
                    "rows": []
                });
            });

            it.should("not parse a row if there is a trailing delimiter and there is more data", function () {
                var data = "first_name,last_name,email_address,";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "first_name,last_name,email_address,",
                    "rows": []
                });
            });

            it.should("parse a row if a new line is found and there is more data", function () {
                var data = "first_name,last_name,email_address\r\n";
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });

        });

        it.describe("escaped values", function (it) {

            it.should("parse a block of CSV text", function () {
                var data = 'first_name,last_name,email_address\r\n"First,1","Last,1","email1@email.com"';
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First,1", "Last,1", "email1@email.com"]
                    ]
                });
            });

            it.should("parse a block of CSV text with escaped escaped char", function () {
                var data = 'first_name,last_name,email_address\r\n"First,""1""","Last,""1""","email1@email.com"';
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First,\"1\"", "Last,\"1\"", "email1@email.com"]
                    ]
                });
            });

            it.should("parse a block of CSV text with alternate escape char", function () {
                var data = 'first_name,last_name,email_address\r\n"First,\\"1\\"","Last,\\"1\\"","email1@email.com"';
                var myParser = parser({delimiter: ",", escape: "\\"});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ["First,\"1\"", "Last,\"1\"", "email1@email.com"]
                    ]
                });
            });

            it.should("return the rest of the line if a complete value is not found", function () {
                var data = 'first_name,last_name,email_address\r\n"First,""1""","Last,""1""","email1@email.com';
                var myParser = parser({delimiter: ","});
                assert.deepEqual(myParser(data, true), {
                    "line": '"First,""1""","Last,""1""","email1@email.com',
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });

            it.should("accept more data appended to the returned line with escaped values", function () {
                var data = 'first_name,last_name,email_address\r\n"First,""1""","Last,""1""","email1@email.com';
                var myParser = parser({delimiter: ","}),
                    parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"First,""1""","Last,""1""","email1@email.com',
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
                assert.deepEqual(myParser(parsedData.line + '"\r\n"First,""2""","Last,""2""","email2@email.com"', false), {
                    line: "",
                    rows: [
                        ["First,\"1\"", "Last,\"1\"", "email1@email.com"],
                        ["First,\"2\"", "Last,\"2\"", "email2@email.com"]
                    ]
                });
            });

            it.should("throw an error if there is not more data and there is an invalid escape sequence", function () {
                var data = 'first_name,last_name,email_address\r\n"First,""1""","Last,""1""","email1@email.com';
                var myParser = parser({delimiter: ","}),
                    parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"First,""1""","Last,""1""","email1@email.com',
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
                assert.throws(function () {
                    assert.deepEqual(myParser(parsedData.line + '\r\n"First,"",2""","Last""2""","email2@email.com"', false), {
                        line: "",
                        rows: [
                            ["First,\"1\"", "Last,\"1\"", "email1@email.com"],
                            ["First,\"2\"", "Last,\"2\"", "email2@email.com"]
                        ]
                    });
                }, Error, ' Parse Error: expected: \'"\' got: \'F\'. at \'First,""2""","Last""2""","email2@email.com"');
            });

            it.should("handle empty values properly", function () {
                var data = '"","",""\r\n,Last4,email4@email.com';
                var myParser = parser({delimiter: ","}),
                    parsedData = myParser(data, false);
                assert.deepEqual(parsedData, {
                    "line": "", "rows": [
                        ["", "", ""],
                        ["", "Last4", "email4@email.com"]
                    ]
                });
            });

            it.should("not parse a row if a new line is not found and there is more data", function () {
                var data = '"first_name","last_name","email_address"';
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"first_name","last_name","email_address"',
                    "rows": []
                });
            });

            it.should("not parse a row if there is a trailing delimiter and there is more data", function () {
                var data = '"first_name","last_name","email_address",';
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": '"first_name","last_name","email_address",',
                    "rows": []
                });
            });

            it.should("parse a row if a new line is found and there is more data", function () {
                var data = '"first_name","last_name","email_address"\r\n';
                var myParser = parser({delimiter: ","});
                var parsedData = myParser(data, true);
                assert.deepEqual(parsedData, {
                    "line": "",
                    "rows": [
                        ["first_name", "last_name", "email_address"]
                    ]
                });
            });
        });

        it.describe("null quote", function (it) {
            it("should ignore escaping if quote is null", function () {
                var data = 'first_name,last_name,email_address\r\n"First1","Last1","email1@email.com"';
                var myParser = parser({delimiter: ",", quote: null});
                assert.deepEqual(myParser(data, false), {
                    "line": "", "rows": [
                        ["first_name", "last_name", "email_address"],
                        ['"First1"', '"Last1"', '"email1@email.com"']
                    ]
                });
            });
        });

    });

    it.describe("with comments", function (it) {
        it.should("parse a block of CSV text", function () {
            var data = "first_name,last_name,email_address\n#The first row of data\nFirst1,Last1,email1@email.com";
            var myParser = parser({delimiter: ",", comment: "#"});
            assert.deepEqual(myParser(data, false), {
                "line": "", "rows": [
                    ["first_name", "last_name", "email_address"],
                    ["First1", "Last1", "email1@email.com"]
                ]
            });
        });

        it.should("return the rest of the line if there is more data", function () {
            var data = "first_name,last_name,email_address\n#First1,Last1,email1@email.com";
            var myParser = parser({delimiter: ",", comment: "#"});
            assert.deepEqual(myParser(data, true), {
                "line": "#First1,Last1,email1@email.com",
                "rows": [
                    ["first_name", "last_name", "email_address"]
                ]
            });
        });

        it.should("accept new data and return the result", function () {
            var data = "first_name,last_name,email_address\n#This is a comment";
            var myParser = parser({delimiter: ",", comment: "#"});
            var parsedData = myParser(data, true);
            assert.deepEqual(parsedData, {
                "line": "#This is a comment",
                "rows": [
                    ["first_name", "last_name", "email_address"]
                ]
            });
            assert.deepEqual(myParser(parsedData.line + "\nFirst1,Last1,email1@email.com\nFirst2,Last2,email2@email.com", false), {
                "line": "", "rows": [
                    ["First1", "Last1", "email1@email.com"],
                    ["First2", "Last2", "email2@email.com"]
                ]
            });
        });

        it.should("not parse a row if a new line is not found and there is more data", function () {
            var data = "#first_name,last_name,email_address";
            var myParser = parser({delimiter: ",", comment: "#"});
            var parsedData = myParser(data, true);
            assert.deepEqual(parsedData, {
                "line": "#first_name,last_name,email_address",
                "rows": []
            });
        });

        it.should("not parse data as a comment if it is contained in a line", function () {
            var data = "f#irst_name,last_name,email_address";
            var myParser = parser({delimiter: ",", comment: "#"});
            var parsedData = myParser(data, false);
            assert.deepEqual(parsedData, {
                "line": "",
                "rows": [["f#irst_name", "last_name", "email_address"]]
            });
        });

        it.should("not parse data as a comment if it at the beginning but escaped", function () {
            var data = '"#first_name",last_name,email_address';
            var myParser = parser({delimiter: ",", comment: "#"});
            var parsedData = myParser(data, false);
            assert.deepEqual(parsedData, {
                "line": "",
                "rows": [["#first_name", "last_name", "email_address"]]
            });
        });

        it.should("return empty rows if it is all comments as there is no more data and there is not a final row delimiter", function () {
            var data = '#Comment1\n#Comment2';
            var myParser = parser({delimiter: ",", comment: "#"});
            var parsedData = myParser(data, false);
            assert.deepEqual(parsedData, {
                "line": "",
                "rows": []
            });
        });

        it.should("return empty rows if it is all comments as there is no more data and there is a final row delimiter", function () {
            var data = '#Comment1\n#Comment2\n';
            var myParser = parser({delimiter: ",", comment: "#"});
            var parsedData = myParser(data, false);
            assert.deepEqual(parsedData, {
                "line": "",
                "rows": []
            });
        });
    });

});