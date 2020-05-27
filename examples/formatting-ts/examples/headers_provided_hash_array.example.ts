import { format } from '@fast-csv/format';

const csvStream = format({ headers: ['header1', 'header2'] });

csvStream.pipe(process.stdout).on('end', () => process.exit());

csvStream.write([
    ['h1', 'value1a'],
    ['h2', 'value1b'],
]);
csvStream.write([
    ['h1', 'value2a'],
    ['h2', 'value2b'],
]);
csvStream.write([
    ['h1', 'value3a'],
    ['h2', 'value3b'],
]);
csvStream.write([
    ['h1', 'value4a'],
    ['h2', 'value4b'],
]);
csvStream.end();

// Output:
// header1,header2
// value1a,value1b
// value2a,value2b
// value3a,value3b
// value4a,value4b
