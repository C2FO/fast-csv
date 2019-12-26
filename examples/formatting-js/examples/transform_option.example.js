const csv = require('@fast-csv/format');

const transform = row => ({
    header1: row.header1.toUpperCase(),
    header2: row.header2.toUpperCase(),
});

const csvStream = csv.format({ headers: true, transform });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();

// Output:
// header1,header2
// VALUE1A,VALUE2A
// VALUE1A,VALUE2A
// VALUE1A,VALUE2A
// VALUE1A,VALUE2A
