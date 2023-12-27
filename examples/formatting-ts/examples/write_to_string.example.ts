import { writeToString } from '@fast-csv/format';

const rows = [
    ['a', 'b'],
    ['a1', 'b1'],
    ['a2', 'b2'],
];
writeToString(rows)
    .then((data) => {
        return console.log(data);
    })
    .catch((err: Error) => {
        return console.error(err.stack);
    });

// Output:
// a,b
// a1,b1
// a2,b2
