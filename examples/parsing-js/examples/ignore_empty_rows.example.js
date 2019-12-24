const { EOL } = require('os');
const csv = require('@fast-csv/parse');

const CSV_STRING = ['a1,b1', ',', 'a2,b2', '   ,\t', ''].join(EOL);

const stream = csv
    .parse({ ignoreEmpty: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();

// Output:
// [ 'a1', 'b1' ]
// [ 'a2', 'b2' ]
// Parsed 2 rows
