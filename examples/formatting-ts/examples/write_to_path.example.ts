import { resolve } from 'path';
import { readFileSync } from 'fs';
import { writeToPath } from '@fast-csv/format';

const rows = [
    ['a', 'b'],
    ['a1', 'b1'],
    ['a2', 'b2'],
];
const filePath = resolve(__dirname, 'write_to_path.tmp.csv');
writeToPath(filePath, rows)
    .on('error', err => console.error(err))
    .on('finish', () => {
        console.log('File Contents:');
        console.log(readFileSync(filePath).toString());
    });

// Output:
// File Contents:
// a,b
// a1,b1
// a2,b2
