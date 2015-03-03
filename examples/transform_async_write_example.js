var csv = require("../"),
    User = require("./models/user"),
    fs = require("fs"),
    path = require("path");

fs.createReadStream(path.resolve("./assets", "snake_case_users.csv"))
    .pipe(csv.parse({headers: true}))
    //pipe the parsed input into a csv formatter
    .pipe(csv.format({headers: true}))
    //Using the transfrom function from the formatting stream
    .transform(function(row, next){
        User.findById(row.id, function(err, user){
            if(err){
                next(err);
            }else{
                next(void 0, {
                    id: row.id,
                    firstName: row["first_name"],
                    lastName: row["last_name"],
                    address: row.address,
                    //properties from user
                    isVerified: user.isVerified,
                    hasLoggedIn: user.hasLoggedIn,
                    age: user.age
                });
            }
        });
    })
    .pipe(fs.createWriteStream(path.resolve("./assets", "userRecords.csv")))
    .on("end", process.exit);