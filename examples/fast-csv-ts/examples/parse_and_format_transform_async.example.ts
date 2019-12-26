import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import { User } from './models/user';

interface UserCsvRow {
    id: string;
    first_name: string;
    last_name: string;
    address: string;
}

interface UserDetailsRow {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    // properties from user
    isVerified: boolean;
    hasLoggedIn: boolean;
    age: number;
}

fs.createReadStream(path.resolve(__dirname, '..', 'assets', 'snake_case_users.csv'))
    .pipe(csv.parse({ headers: true }))
    // pipe the parsed input into a csv formatter
    .pipe(
        csv.format<UserCsvRow, UserDetailsRow>({ headers: true }),
    )
    // Using the transform function from the formatting stream
    .transform((row, next): void => {
        User.findById(+row.id, (err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return next(err);
            }
            return next(null, {
                id: user.id,
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
