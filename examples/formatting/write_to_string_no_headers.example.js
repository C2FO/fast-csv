const csv = require('../../');

const data = [
    { a: 'a1', b: 'b1' },
    { a: 'a2', b: 'b2' },
];
csv.writeToString(data, { headers: false })
    .then(formattedCsv => {
        console.log(formattedCsv);
        process.exit();
    })
    .catch(err => {
        console.error(err.stack);
        process.exit(1);
    });
