const csv = require('../../');

const rows = [
    [ 'a', 'b' ],
    [ 'a1', 'b1' ],
    [ 'a2', 'b2' ],
];
csv.writeToBuffer(rows).then(data => console.log(data.toString()));
