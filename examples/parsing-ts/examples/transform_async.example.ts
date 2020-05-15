import { EOL } from 'os';
import { parse } from '@fast-csv/parse';

const CSV_STRING = ['firstName,lastName', 'bob,yukon', 'sally,yukon', 'timmy,yukon'].join(EOL);

type UserRow = {
    firstName: string;
    lastName: string;
};

type TransformedUserRow = UserRow & {
    properName: string;
};

const stream = parse<UserRow, TransformedUserRow>({ headers: true })
    .transform((data, cb): void => {
        setImmediate(() =>
            cb(null, {
                firstName: data.firstName.toUpperCase(),
                lastName: data.lastName.toUpperCase(),
                properName: `${data.firstName} ${data.lastName}`,
            }),
        );
    })
    .on('error', (error) => console.error(error))
    .on('data', (row) => console.log(JSON.stringify(row)))
    .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();

// Output:
// {"firstName":"BOB","lastName":"YUKON","properName":"bob yukon"}
// {"firstName":"SALLY","lastName":"YUKON","properName":"sally yukon"}
// {"firstName":"TIMMY","lastName":"YUKON","properName":"timmy yukon"}
// Parsed 3 rows
