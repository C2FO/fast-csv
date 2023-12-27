import { format } from '@fast-csv/format';

const csvStream = format({ headers: true });

csvStream.pipe(process.stdout).on('end', () => {
    return process.exit();
});

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

// Output:
// header,header2
// value1a,value2a
// value1b,value2b
// value1c,value2c
// value1d,value2d
