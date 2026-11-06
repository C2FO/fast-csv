const csv = require('@fast-csv/format');

const csvStream = csv.format({
    headers: ['Full name', 'Age'],
    transform: (row) => ({ 'Full name': row.name, Age: row.age }),
});

csvStream.pipe(process.stdout).on('end', () => process.exit());

csvStream.write({ name: 'John', age: 28 });
csvStream.write({ name: 'Alice', age: 34 });
csvStream.end();

// Output:
// Full name,Age
// John,28
// Alice,34
