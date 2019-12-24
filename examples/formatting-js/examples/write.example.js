const csv = require('@fast-csv/format');

const rows = [
    ['a', 'b'],
    ['a1', 'b1'],
    ['a2', 'b2'],
];
csv.write(rows).pipe(process.stdout);

// Output:
// a,b
// a1,b1
// a2,b2
