import { format } from '@fast-csv/format';

interface InputRow {
    name: string;
    age: number;
}

interface OutputRow {
    'Full name': string;
    Age: number;
}

const csvStream = format<InputRow, OutputRow>({
    headers: ['Full name', 'Age'],
    transform: (row: InputRow): OutputRow => {
        return { 'Full name': row.name, Age: row.age };
    },
});

csvStream.pipe(process.stdout).on('end', () => {
    process.exit();
});

csvStream.write({ name: 'John', age: 28 });
csvStream.write({ name: 'Alice', age: 34 });
csvStream.end();

// Output:
// Full name,Age
// John,28
// Alice,34
