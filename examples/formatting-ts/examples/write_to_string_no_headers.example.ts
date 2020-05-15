import { writeToString } from '@fast-csv/format';

const data = [
    { a: 'a1', b: 'b1' },
    { a: 'a2', b: 'b2' },
];
writeToString(data, { headers: false })
    .then((formattedCsv) => {
        console.log(formattedCsv);
        process.exit();
    })
    .catch((err) => {
        console.error(err.stack);
        process.exit(1);
    });

// Output:
// a1,b1
// a2,b2
