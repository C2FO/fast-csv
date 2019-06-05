const { EOL } = require('os');
const csv = require('../../');

const CSV_STRING = [
    'a,b',
    'a1,b1',
    'a2,b2',
].join(EOL);

csv
    .fromString(CSV_STRING, { headers: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
