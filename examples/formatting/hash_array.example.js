const csv = require('../../');

const csvStream = csv.format({ headers: true });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write([
    ['header', 'value1a'],
    ['header2', 'value2a'],
]);
csvStream.write([
    ['header', 'value1b'],
    ['header2', 'value2b'],
]);
csvStream.write([
    ['header', 'value1c'],
    ['header2', 'value2c'],
]);
csvStream.write([
    ['header', 'value1d'],
    ['header2', 'value2d'],
]);
csvStream.end();
