const path = require('path');
const csv = require('../../');

const rows = [
    [ 'a', 'b' ],
    [ 'a1', 'b1' ],
    [ 'a2', 'b2' ],
];
csv.writeToPath(path.resolve(__dirname, 'tmp.csv'), rows)
    .on('error', err => console.error(err))
    .on('finish', () => console.log('Done writing.'));
