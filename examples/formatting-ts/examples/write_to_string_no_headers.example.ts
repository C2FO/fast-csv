import { writeToString } from '@fast-csv/format';

const data = [
    { a: 'a1', b: 'b1' },
    { a: 'a2', b: 'b2' },
];
writeToString(data, { headers: false })
    .then((formattedCsv) => {
        return console.log(formattedCsv);
    })
    .catch((err: Error) => {
        return console.error(err.stack);
    });

// Output:
// a1,b1
// a2,b2
