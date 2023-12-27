import { EOL } from 'os';
import { parse } from '@fast-csv/parse';

const CSV_STRING = ['firstName,lastName', 'bob,yukon', 'sally,yukon', 'timmy,yukon'].join(EOL);
type UserRow = {
    firstName: string;
    lastName: string;
};
const stream = parse<UserRow, UserRow>({ headers: true })
    .validate((data: UserRow): boolean => {
        return data.firstName !== 'bob';
    })
    .on('error', (error) => {
        return console.error(error);
    })
    .on('data', (row: UserRow) => {
        return console.log(`Valid [row=${JSON.stringify(row)}]`);
    })
    .on('data-invalid', (row, rowNumber: number) => {
        return console.log(`Invalid [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}]`);
    })
    .on('end', (rowCount: number) => {
        return console.log(`Parsed ${rowCount} rows`);
    });

stream.write(CSV_STRING);
stream.end();

// Output:
// Invalid [rowNumber=1] [row={"firstName":"bob","lastName":"yukon"}]
// Valid [row={"firstName":"sally","lastName":"yukon"}]
// Valid [row={"firstName":"timmy","lastName":"yukon"}]
// Parsed 3 rows
