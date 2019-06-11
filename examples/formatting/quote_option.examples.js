const csv = require('../../');

const stream = csv.format({ quote: "'" });
stream.pipe(process.stdout);

// each field will be quoted because it contains a delimiter
stream.write([ 'a,a', 'b,b' ]);
stream.write([ 'a1,a1', 'b1,b1' ]);
stream.write([ 'a2,a2', 'b2,b2' ]);
stream.end();
