const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

fs.createReadStream(path.resolve(__dirname, 'assets', 'parse.csv'))
    .pipe(csv.parse({ headers: true }))
    .on('error', (error) => console.error(error))
    .on('data', (row) => console.log(row))
    .on('end', (rowCount) => console.log(`Parsed ${rowCount} rows`));

// Output:
// { header1: 'row1-col1', header2: 'row1-col2' }
// { header1: 'row2-col1', header2: 'row2-col2' }
// { header1: 'row3-col1', header2: 'row3-col2' }
// { header1: 'row4-col1', header2: 'row4-col2' }
// { header1: 'row5-col1', header2: 'row5-col2' }
// Parsed 5 rows
