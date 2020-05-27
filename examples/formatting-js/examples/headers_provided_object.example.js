const csv = require('@fast-csv/format');

const csvStream = csv.format({ headers: ['header2', 'header1'] });

csvStream.pipe(process.stdout).on('end', () => process.exit());

csvStream.write({ header1: 'value1a', header2: 'value1b' });
csvStream.write({ header1: 'value2a', header2: 'value2b' });
csvStream.write({ header1: 'value3a', header2: 'value3b' });
csvStream.write({ header1: 'value4a', header2: 'value4b' });
csvStream.end();

// Output:
// header2,header1
// value1b,value1a
// value2b,value2a
// value3b,value3a
// value4b,value4a
