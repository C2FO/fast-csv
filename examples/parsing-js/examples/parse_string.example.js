const { EOL } = require('os');
const csv = require('@fast-csv/parse');

const CSV_STRING = ['a,b', 'a1,b1', 'a2,b2'].join(EOL);

csv.parseString(CSV_STRING, { headers: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

// Output:
// { a: 'a1', b: 'b1' }
// { a: 'a2', b: 'b2' }
// Parsed 2 rows
