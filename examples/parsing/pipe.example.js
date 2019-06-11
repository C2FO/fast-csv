const fs = require('fs');
const path = require('path');
const csv = require('../../');

fs.createReadStream(path.resolve(__dirname, '..', 'assets', 'snake_case_users.csv'))
    .pipe(csv.parse())
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
