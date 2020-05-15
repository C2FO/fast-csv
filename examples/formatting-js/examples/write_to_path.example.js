const fs = require('fs');
const path = require('path');
const csv = require('@fast-csv/format');

const rows = [
    ['a', 'b'],
    ['a1', 'b1'],
    ['a2', 'b2'],
];
const filePath = path.resolve(__dirname, 'write_to_path.tmp.csv');
csv.writeToPath(filePath, rows)
    .on('error', (err) => console.error(err))
    .on('finish', () => {
        console.log('File Contents:');
        console.log(fs.readFileSync(filePath).toString());
    });

// Output:
// File Contents:
// a,b
// a1,b1
// a2,b2
