import { parse } from '@fast-csv/parse';

const rows = [
    'skip1_header1,skip1_header2\n',
    'skip2_header1,skip2_header2\n',
    'header1,header2\n',
    'col1,col1\n',
    'col2,col2\n',
    'col3,col3\n',
    'col4,col4\n',
];

const stream = parse({ headers: true, skipLines: 2 })
    .on('error', (error) => console.error(error))
    .on('data', (row) => console.log(row))
    .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

rows.forEach((row) => stream.write(row));
stream.end();

// Output:
// { header1: 'col1', header2: 'col1' }
// { header1: 'col2', header2: 'col2' }
// { header1: 'col3', header2: 'col3' }
// { header1: 'col4', header2: 'col4' }
// Parsed 4 rows
