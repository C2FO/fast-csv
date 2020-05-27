const csv = require('@fast-csv/format');

const rows = [
    ['a', 'b'],
    ['a1', 'b1'],
    ['a2', 'b2'],
];
csv.writeToString(rows)
    .then((data) => console.log(data))
    .catch((e) => console.error(e));

// Output:
// a,b
// a1,b1
// a2,b2
