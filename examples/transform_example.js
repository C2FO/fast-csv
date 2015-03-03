var csv = require("../"),
    fs = require("fs"),
    path = require("path");

var stream = fs.createReadStream(path.resolve("./assets", "snake_case_users.csv"))
    .pipe(csv.parse({headers: true}))
    .transform(function (row) {
        return {
            id: row.id,
            firstName: row["first_name"],
            lastName: row["last_name"],
            address: row.address
        };
    })
    .on("readable", function () {
        var row;
        while (null !== (row = stream.read())) {
            console.log(row);
        }
    })
    .on("end", process.exit);