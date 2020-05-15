import { writeToBuffer } from '@fast-csv/format';

const rows = [
    ['a', 'b'],
    ['a1', 'b1'],
    ['a2', 'b2'],
];
writeToBuffer(rows).then((data) => console.log(data.toString()));

// Output:
// a,b
// a1,b1
// a2,b2
