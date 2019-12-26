import { EOL } from 'os';
import { parse } from '@fast-csv/parse';

const CSV_STRING = ['a,b', 'a1,b1', 'a2,b2'].join(EOL);

const stream = parse({ headers: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();

// Output:
// { a: 'a1', b: 'b1' }
// { a: 'a2', b: 'b2' }
// Parsed 2 rows
