var csv = require("../"),
    fs = require("fs"),
    path = require("path");

var stream = fs.createReadStream(path.resolve("./assets", "snake_case_users.csv"))
    .pipe(csv.parse({headers: true}))
    .validate(function (row) {
        return (row.id % 2) === 0;
    })
    .on("readable", function () {
        var row;
        while (null !== (row = stream.read())) {
            console.log(row);
        }
    })
    .on("end", process.exit);