import { EOL } from 'os';
import { parse } from '@fast-csv/parse';

const CSV_STRING = ['firstName,lastName', 'bob,yukon', 'sally,yukon', 'timmy,yukon'].join(EOL);

type UserRow = {
    firstName: string;
    lastName: string;
};

const stream = parse<UserRow, UserRow>({ headers: true })
    .validate((row, cb): void => {
        setImmediate(() => {
            return cb(null, row.firstName !== 'bob');
        });
    })
    .on('error', (error) => {
        return console.error(error);
    })
    .on('data', (row) => {
        return console.log(`Valid [row=${JSON.stringify(row)}]`);
    })
    .on('data-invalid', (row) => {
        return console.log(`Invalid [row=${JSON.stringify(row)}]`);
    })
    .on('end', (rowCount: number) => {
        return console.log(`Parsed ${rowCount} rows`);
    });

stream.write(CSV_STRING);
stream.end();

// Output:
// Invalid [row={"firstName":"bob","lastName":"yukon"}]
// Valid [row={"firstName":"sally","lastName":"yukon"}]
// Valid [row={"firstName":"timmy","lastName":"yukon"}]
// Parsed 3 rows
