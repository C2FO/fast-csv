const csv = require('@fast-csv/format');

const data = [
    { a: 'a1', b: 'b1' },
    { a: 'a2', b: 'b2' },
];

const transform = row => ({
    A: row.a,
    B: row.b,
});

csv.writeToString(data, { headers: true, transform })
    .then(formattedCsv => console.log(formattedCsv))
    .catch(err => console.error(err.stack));

// Output:
// A,B
// a1,b1
// a2,b2
