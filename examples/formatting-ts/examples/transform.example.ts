import { format } from '@fast-csv/format';

interface CsvRow {
    header1: string;
    header2: string;
}

const csvStream = format<CsvRow, CsvRow>({ headers: true }).transform((row: CsvRow) => ({
    header1: row.header1.toUpperCase(),
    header2: row.header2.toUpperCase(),
}));

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();

// Output:
// header1,header2
// VALUE1A,VALUE2A
// VALUE1A,VALUE2A
// VALUE1A,VALUE2A
// VALUE1A,VALUE2A
