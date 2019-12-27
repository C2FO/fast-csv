import { format } from '@fast-csv/format';

const csvStream = format({ headers: ['header2', 'header1'], writeHeaders: false });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();

// Output:
// value2a,value1a
// value2a,value1a
// value2a,value1a
// value2a,value1a
