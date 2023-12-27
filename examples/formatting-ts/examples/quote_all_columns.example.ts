import { format } from '@fast-csv/format';

const csvStream = format({ headers: true, quoteColumns: true });

csvStream.pipe(process.stdout).on('end', () => {
    return process.exit();
});

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();

// Output:
// "header1","header2"
// "value1a","value2a"
// "value1a","value2a"
// "value1a","value2a"
// "value1a","value2a"
