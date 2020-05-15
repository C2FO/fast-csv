const csv = require('@fast-csv/parse');

const rows = [
    'header1,header2\n',
    'col1,col1\n',
    'col2,col2\n',
    'col3,col3\n',
    'col4,col4\n',
    'col5,col5\n',
    'col6,col6\n',
];

const stream = csv
    .parse({ headers: true, skipRows: 2 })
    .on('error', (error) => console.error(error))
    .on('data', (row) => console.log(row))
    .on('end', (rowCount) => console.log(`Parsed ${rowCount} rows`));

rows.forEach((row) => stream.write(row));
stream.end();

// Output:
// { header1: 'col3', header2: 'col3' }
// { header1: 'col4', header2: 'col4' }
// { header1: 'col5', header2: 'col5' }
// { header1: 'col6', header2: 'col6' }
// Parsed 4 rows
