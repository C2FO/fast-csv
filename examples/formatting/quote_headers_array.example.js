const csv = require('../../');

const csvStream = csv.format({ headers: [ 'header1', 'header2' ], quoteHeaders: [ false, true ] });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
