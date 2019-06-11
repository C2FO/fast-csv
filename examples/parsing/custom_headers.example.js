const { EOL } = require('os');
const csv = require('../../');

const CSV_STRING = [
    'a1,b1',
    'a2,b2',
].join(EOL);

const stream = csv
    .parse({ headers: [ 'a', 'b' ] })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();
