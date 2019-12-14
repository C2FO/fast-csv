const csv = require('../../');

const csvStream = csv.format({ headers: true, quoteColumns: { header2: true }, quoteHeaders: false });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
