var csv = require("../");
csv.writeToString(
    [
        {a: "a1", b: "b1"},
        {a: "a2", b: "b2"}
    ],
    {
        headers: true,
        transform: function (row) {
            return {
                A: row.a,
                B: row.b
            };
        }
    },
    function (err, data) {
        console.log(data); //"A,B\na1,b1\na2,b2\n"
    }
);