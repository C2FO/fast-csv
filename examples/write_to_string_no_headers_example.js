var csv = require("../");

csv.writeToString(
    [
        {a: "a1", b: "b1"},
        {a: "a2", b: "b2"}
    ], {
        headers: false
    }, function (err, data) {
        console.log('err:', err, 'data: |' + data + '|');
    }
);