const csv = require('../../');

const csvStream = csv.format({ headers: ['header1', 'header2'] });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write(['value1a', 'value1b']);
csvStream.write(['value2a', 'value2b']);
csvStream.write(['value3a', 'value3b']);
csvStream.write(['value4a', 'value4b']);
csvStream.end();
