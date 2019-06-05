const fs = require('fs');
const path = require('path');
const csv = require('../');
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
