import { EOL } from 'os';
import { parse } from '@fast-csv/parse';

const CSV_STRING = ['header1,header2', 'a1,b1', 'a2,b2'].join(EOL);

const stream = parse({
    headers: (headers) => {
        return headers.map((h) => {
            return h?.toUpperCase();
        });
    },
})
    .on('error', (error) => {
        return console.error(error);
    })
    .on('data', (row) => {
        return console.log(row);
    })
    .on('end', (rowCount: number) => {
        return console.log(`Parsed ${rowCount} rows`);
    });

stream.write(CSV_STRING);
stream.end();

// Output:
// { HEADER1: 'a1', HEADER2: 'b1' }
// { HEADER1: 'a2', HEADER2: 'b2' }
// Parsed 2 rows
