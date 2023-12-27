import { format } from '@fast-csv/format';

interface CsvRow {
    header1: string;
    header2: string;
}

const transform = (row: CsvRow): CsvRow => {
    return {
        header1: row.header1.toUpperCase(),
        header2: row.header2.toUpperCase(),
    };
};

const csvStream = format({ headers: true, transform });

csvStream.pipe(process.stdout).on('end', () => {
    return process.exit();
});

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
