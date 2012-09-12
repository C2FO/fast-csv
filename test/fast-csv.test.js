var it = require("it"),
    assert = require("assert"),
    fs = require("fs"),
    comb = require("comb"),
    csv = require("index"),
    path = require("path");

var expected1 = [
    {first_name:"First1", last_name:"Last1", email_address:"email1@email.com", address:"1 Street St, State ST, 88888"},
    {first_name:"First2", last_name:"Last2", email_address:"email2@email.com", address:"2 Street St, State ST, 88888"},
    {first_name:"First3", last_name:"Last3", email_address:"email3@email.com", address:"3 Street St, State ST, 88888"},
    {first_name:"First4", last_name:"Last4", email_address:"email4@email.com", address:"4 Street St, State ST, 88888"},
    {first_name:"First5", last_name:"Last5", email_address:"email5@email.com", address:"5 Street St, State ST, 88888"},
    {first_name:"First6", last_name:"Last6", email_address:"email6@email.com", address:"6 Street St, State ST, 88888"},
    {first_name:"First7", last_name:"Last7", email_address:"email7@email.com", address:"7 Street St, State ST, 88888"},
    {first_name:"First8", last_name:"Last8", email_address:"email8@email.com", address:"8 Street St, State ST, 88888"},
    {first_name:"First9", last_name:"Last9", email_address:"email9@email.com", address:"9 Street St, State ST, 88888"}
];

var expected2 = [
    [ 'First1', 'Last1', 'email1@email.com', '1 Street St, State ST, 88888' ],
    [ 'First2', 'Last2', 'email2@email.com', '2 Street St, State ST, 88888' ],
    [ 'First3', 'Last3', 'email3@email.com', '3 Street St, State ST, 88888' ],
    [ 'First4', 'Last4', 'email4@email.com', '4 Street St, State ST, 88888' ],
    [ 'First5', 'Last5', 'email5@email.com', '5 Street St, State ST, 88888' ],
    [ 'First6', 'Last6', 'email6@email.com', '6 Street St, State ST, 88888' ],
    [ 'First7', 'Last7', 'email7@email.com', '7 Street St, State ST, 88888' ],
    [ 'First8', 'Last8', 'email8@email.com', '8 Street St, State ST, 88888' ],
    [ 'First9', 'Last9', 'email9@email.com', '9 Street St, State ST, 88888' ]
];

var expected3 = [
    {first_name:"First1", last_name:"Last1", email_address:"email1@email.com", address:'1 "Street" St, State ST, 88888'},
    {first_name:"First2", last_name:"Last2", email_address:"email2@email.com", address:'2 "Street" St, State ST, 88888'},
    {first_name:"First3", last_name:"Last3", email_address:"email3@email.com", address:'3 "Street" St, State ST, 88888'},
    {first_name:"First4", last_name:"Last4", email_address:"email4@email.com", address:'4 "Street" St, State ST, 88888'},
    {first_name:"First5", last_name:"Last5", email_address:"email5@email.com", address:'5 "Street" St, State ST, 88888'},
    {first_name:"First6", last_name:"Last6", email_address:"email6@email.com", address:'6 "Street" St, State ST, 88888'},
    {first_name:"First7", last_name:"Last7", email_address:"email7@email.com", address:'7 "Street" St, State ST, 88888'},
    {first_name:"First8", last_name:"Last8", email_address:"email8@email.com", address:'8 "Street" St, State ST, 88888'},
    {first_name:"First9", last_name:"Last9", email_address:"email9@email.com", address:'9 "Street" St, State ST, 88888'}
];

var expected4 = [
    {first_name:"First1", last_name:"Last1", email_address:"email1@email.com"},
    {first_name:"First2", last_name:"Last2", email_address:"email2@email.com"},
    {first_name:"First3", last_name:"Last3", email_address:"email3@email.com"},
    {first_name:"First4", last_name:"Last4", email_address:"email4@email.com"},
    {first_name:"First5", last_name:"Last5", email_address:"email5@email.com"},
    {first_name:"First6", last_name:"Last6", email_address:"email6@email.com"},
    {first_name:"First7", last_name:"Last7", email_address:"email7@email.com"},
    {first_name:"First8", last_name:"Last8", email_address:"email8@email.com"},
    {first_name:"First9", last_name:"Last9", email_address:"email9@email.com"}
];

var expectedValid = [
    {first_name:"First1", last_name:"Last1", email_address:"email1@email.com"},
    {first_name:"First3", last_name:"Last3", email_address:"email3@email.com"},
    {first_name:"First5", last_name:"Last5", email_address:"email5@email.com"},
    {first_name:"First7", last_name:"Last7", email_address:"email7@email.com"},
    {first_name:"First9", last_name:"Last9", email_address:"email9@email.com"}
];

var expectedInvalid = [
    {first_name:"First2", last_name:"Last2", email_address:"email2@email.com"},
    {first_name:"First4", last_name:"Last4", email_address:"email4@email.com"},
    {first_name:"First6", last_name:"Last6", email_address:"email6@email.com"},
    {first_name:"First8", last_name:"Last8", email_address:"email8@email.com"}
];

var expectedCamelCase = [
    {firstName:"First1", lastName:"Last1", emailAddress:"email1@email.com"},
    {firstName:"First2", lastName:"Last2", emailAddress:"email2@email.com"},
    {firstName:"First3", lastName:"Last3", emailAddress:"email3@email.com"},
    {firstName:"First4", lastName:"Last4", emailAddress:"email4@email.com"},
    {firstName:"First5", lastName:"Last5", emailAddress:"email5@email.com"},
    {firstName:"First6", lastName:"Last6", emailAddress:"email6@email.com"},
    {firstName:"First7", lastName:"Last7", emailAddress:"email7@email.com"},
    {firstName:"First8", lastName:"Last8", emailAddress:"email8@email.com"},
    {firstName:"First9", lastName:"Last9", emailAddress:"email9@email.com"}
];

var expected7 = [
    {first_name:"First1", last_name:"Last1", email_address:"email1@email.com", address:""},
    {first_name:"First2", last_name:"Last2", email_address:"email2@email.com", address:""},
    {first_name:"First3", last_name:"Last3", email_address:"email3@email.com", address:""},
    {first_name:"First4", last_name:"Last4", email_address:"email4@email.com", address:""},
    {first_name:"First5", last_name:"Last5", email_address:"email5@email.com", address:""},
    {first_name:"First6", last_name:"Last6", email_address:"email6@email.com", address:""},
    {first_name:"First7", last_name:"Last7", email_address:"email7@email.com", address:""},
    {first_name:"First8", last_name:"Last8", email_address:"email8@email.com", address:""},
    {first_name:"First9", last_name:"Last9", email_address:"email9@email.com", address:""}
];

it.describe("fast-csv parser",function (it) {


    it.should("parse a csv without quotes or escapes", function (next) {
        var actual = [];
        csv(path.resolve(__dirname, "./assets/test4.csv"), {headers:true})
            .on("data",function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected4);
                assert.equal(count, actual.length);
                next();
            })
            .parse();
    });

    it.should("parse a csv with \" escapes", function (next) {
        var actual = [];
        csv(path.resolve(__dirname, "./assets/test1.csv"), {headers:true})
            .on("data",function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected1);
                assert.equal(count, actual.length);
                next();
            })
            .parse();
    });
    it.should("parse a csv with without headers", function (next) {
        var actual = [];
        csv(path.resolve(__dirname, "./assets/test2.csv"))
            .on("data",function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected2);
                assert.equal(count, actual.length);
                next();
            })
            .parse();
    });

    it.should("parse a csv with ' escapes", function (next) {
        var actual = [];
        csv(path.resolve(__dirname, "./assets/test3.csv"), {headers:true})
            .on("data",function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected3);
                assert.equal(count, actual.length);
                next();
            })
            .parse();
    });

    it.should("allow specifying of columns", function (next) {
        var actual = [];
        csv(path.resolve(__dirname, "./assets/test2.csv"), {headers:["first_name", "last_name", "email_address", "address"]})
            .on("data",function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expected1);
                assert.equal(count, actual.length);
                next();
            })
            .parse();
    });

    it.should("allow validation of rows", function (next) {
        var actual = [], invalid = [];
        csv(path.resolve(__dirname, "./assets/test4.csv"), {headers:true})
            .validate(function (data) {
                return parseInt(data.first_name.replace(/^First/, ""), 10) % 2;
            })
            .on("data", function (data, index) {
                actual.push(data);
            })
            .on("data-invalid", function (data, index) {
                invalid.push(data);
            })
            .on("end", function (count) {
                assert.deepEqual(actual, expectedValid);
                assert.deepEqual(invalid, expectedInvalid);
                assert.equal(count, actual.length);
                next();
            })
            .parse();
    });

    it.should("allow transforming of data", function (next) {
        var actual = [];
        csv(path.resolve(__dirname, "./assets/test4.csv"), {headers:true})
            .transform(function (data) {
                var ret = {};
                ["first_name", "last_name", "email_address"].forEach(function (prop) {
                    ret[comb.camelize(prop)] = data[prop];
                })
                return ret;
            })
            .on("data",function (data, index) {
                actual[index] = data;
            }).
            on("end", function (count) {
                assert.deepEqual(actual, expectedCamelCase);
                assert.equal(count, actual.length);
                next();
            })
            .parse();
    });

    it.should("accept a stream", function (next) {
        var actual = [];
        csv(fs.createReadStream(path.resolve(__dirname, "./assets/test4.csv")), {headers:true})
            .on("data",function (data, index) {
                actual[index] = data;
            }).
            on("end", function () {
                assert.deepEqual(actual, expected4);
                next();
            })
            .parse();
    });

    it.should("emit an error for invalid rows", function (next) {
        var actual = [];
        csv(path.resolve(__dirname, "./assets/test6.csv"), {headers:true})
            .on("data", function (data, index) {
                actual.push(data);
            })
            .on("end", function (error) {
                assert.deepEqual(actual, expected1.splice(1));
                next();
            })
            .on("error", function (error) {
                assert.equal(error.message, 'Invalid row First1\\\\s   , Last1 ,email1@email.com,"1 Street St, State ST, 88888"');
            })
            .parse();
    });

    it.should("handle a trailing comma", function (next) {
        var actual = [];
        csv(path.resolve(__dirname, "./assets/test7.csv"), {headers:true})
            .on("data", function (data, index) {
                actual.push(data);
            })
            .on("end", function (count) {
                assert.deepEqual(actual, expected7);
                assert.equal(count, actual.length);
                next();
            })
            .parse();
    });

    it.should("throw an error if an invalid path or stream is passed in", function () {
        assert.throws(function () {
            csv(1).parse();
        });
    });

    it.should("throw an error if a validate is not called with a function", function () {
        assert.throws(function () {
            csv(path.resolve(__dirname, "./assets/test7.csv"), {headers:true}).validate("hello");
        });
    });

    it.should("throw an error if a transform is not called with a function", function () {
        assert.throws(function () {
            csv(path.resolve(__dirname, "./assets/test7.csv"), {headers:true}).transform("hello");
        });
    });


}).as(module).run();