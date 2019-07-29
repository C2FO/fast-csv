const csv = require('../../');

const csvStream = csv.format({ headers: [ 'header2' ] });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value1b' });
csvStream.write({ header1: 'value2a', header2: 'value2b' });
csvStream.write({ header1: 'value3a', header2: 'value3b' });
csvStream.write({ header1: 'value4a', header2: 'value4b' });
csvStream.end();
