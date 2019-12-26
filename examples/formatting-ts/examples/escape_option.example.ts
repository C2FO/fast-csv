import { format } from '@fast-csv/format';

const stream = format({ escape: "'" });
stream.pipe(process.stdout);

// wrap each field in a quote so it is escaped and quoted
stream.write(['"a"', '"b"']);
stream.write(['"a1"', '"b1"']);
stream.write(['"a2"', '"b2"']);
stream.end();

// Output:
// "'"a'"","'"b'""
// "'"a1'"","'"b1'""
// "'"a2'"","'"b2'""
