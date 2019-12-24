const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const User = require('./models/user');

fs.createReadStream(path.resolve(__dirname, 'assets', 'snake_case_users.csv'))
    .pipe(csv.parse({ headers: true }))
    // pipe the parsed input into a csv formatter
    .pipe(csv.format({ headers: true }))
    // Using the transform function from the formatting stream
    .transform((row, next) => {
        User.findById(row.id, (err, user) => {
            if (err) {
                return next(err);
            }
            return next(null, {
                id: row.id,
                firstName: row.first_name,
                lastName: row.last_name,
                address: row.address,
                // properties from user
                isVerified: user.isVerified,
                hasLoggedIn: user.hasLoggedIn,
                age: user.age,
            });
        });
    })
    .pipe(process.stdout)
    .on('end', process.exit);

// Output:
// id,firstName,lastName,address,isVerified,hasLoggedIn,age
// 1,Bob,Yukon,1111 State St. Yukon AK,false,false,11
// 2,Sally,Yukon,1111 State St. Yukon AK,true,false,12
// 3,Bobby,Yukon,1111 State St. Yukon AK,false,false,13
// 4,Jane,Yukon,1111 State St. Yukon AK,true,true,14
// 5,Dick,Yukon,1111 State St. Yukon AK,false,false,15
// 6,John,Doe,1112 State St. Yukon AK,true,false,16
// 7,Jane,Doe,1113 State St. Yukon AK,false,false,17
// 8,Billy,Doe,1112 State St. Yukon AK,true,true,18
// 9,Edith,Doe,1112 State St. Yukon AK,false,false,19
