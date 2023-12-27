import { writeToBuffer } from '@fast-csv/format';

const rows = [
    ['a', 'b'],
    ['a1', 'b1'],
    ['a2', 'b2'],
];
writeToBuffer(rows)
    .then((data) => {
        return console.log(data.toString());
    })
    .catch((err: Error) => {
        return console.error(err.stack);
    });

// Output:
// a,b
// a1,b1
// a2,b2
