const csv = require('../../');

const csvStream = csv
    .format({ headers: true })
    .transform((row, cb) => {
        setImmediate(() => cb(null, {
            header1: row.header1.toUpperCase(),
            header2: row.header2.toUpperCase(),
        }));
    });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
