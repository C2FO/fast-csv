import { write } from '@fast-csv/format';

const rows = [
    ['a', 'b'],
    ['a1', 'b1'],
    ['a2', 'b2'],
];
write(rows).pipe(process.stdout);

// Output:
// a,b
// a1,b1
// a2,b2
