const csv = require('@fast-csv/format');

const csvStream = csv.format({ headers: true });

csvStream.pipe(process.stdout).on('end', () => process.exit());

csvStream.write({ header1: 'value1a', header2: 'value1b' });
csvStream.write({ header1: 'value2a', header2: 'value2b' });
csvStream.write({ header1: 'value3a', header2: 'value3b' });
csvStream.write({ header1: 'value4a', header2: 'value4b' });
csvStream.end();

// Output:
// header1,header2
// value1a,value1b
// value2a,value2b
// value3a,value3b
// value4a,value4b
