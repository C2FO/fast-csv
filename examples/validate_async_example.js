var csv = require("../"),
    User = require("./models/user"),
    fs = require("fs"),
    path = require("path");

var stream = fs.createReadStream(path.resolve("./assets", "snake_case_users.csv"))
    .pipe(csv.parse({headers: true}))
    .validate(function (row, next) {
        User.findById(row.id, function (err, user) {
            if (err) {
                next(err);
            } else {
                next(void 0, user.isVerified);
            }
        });
    })
    .on("readable", function () {
        var row;
        while (null !== (row = stream.read())) {
            console.log(row);
        }
    })
    .on("end", process.exit);