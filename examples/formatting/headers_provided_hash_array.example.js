const csv = require('../../');

const csvStream = csv.format({ headers: [ 'header1', 'header2' ] });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

csvStream.write([ [ 'h1', 'value1a' ], [ 'h2', 'value1b' ] ]);
csvStream.write([ [ 'h1', 'value2a' ], [ 'h2', 'value2b' ] ]);
csvStream.write([ [ 'h1', 'value3a' ], [ 'h2', 'value3b' ] ]);
csvStream.write([ [ 'h1', 'value4a' ], [ 'h2', 'value4b' ] ]);
csvStream.end();
