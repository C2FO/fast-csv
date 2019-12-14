const csv = require('../../');

const stream = csv
    .parse({ headers: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write('header1,header2\n');
stream.write('col1,col2');
stream.end();
