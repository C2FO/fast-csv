import { RowMap, writeToString } from '@fast-csv/format';

const data = [
    { a: 'a1', b: 'b1' },
    { a: 'a2', b: 'b2' },
];

const transform = (row: RowMap<string>): RowMap => ({
    A: row.a,
    B: row.b,
});

writeToString(data, { headers: true, transform })
    .then((formattedCsv) => console.log(formattedCsv))
    .catch((err: Error) => console.error(err.stack));

// Output:
// A,B
// a1,b1
// a2,b2
