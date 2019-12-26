import { writeToStream } from '@fast-csv/format';

const rows = [
    ['a', 'b'],
    ['a1', 'b1'],
    ['a2', 'b2'],
];
writeToStream(process.stdout, rows);

// Output:
// a,b
// a1,b1
// a2,b2
