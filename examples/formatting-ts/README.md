`@fast-csv/format` typescript formatting examples.

## Usage

```sh
npm run build
```

To run all examples

```sh
npm run all-examples
```

To see a list of all available examples

```sh
npm run list
```

To run a specific example

```sh
npm run example -- {example_name}
```

## Examples

* [Alternate `delimiter`](#examples-alternate-delimiter)
* [Alternate `rowDelimiter`](#examples-alternate-row-delimiter)
* [Alternate `quote`](#examples-alternate-quote)
* [Alternate `escape`](#examples-alternate-escape)
* [Headers](#examples-headers)
  * Auto Discovery
    * [Object Rows](#headers-auto-discover-object)
    * [Hash Array Rows](#headers-auto-discover-hash-array)
  * Provide Headers
    * [Array Rows](#headers-provided-array)
    * [Hash Array Rows](#headers-provided-hash-array)
    * [Object Rows - Reorder Columns](#headers-provided-object)
    * [Object Rows - Remove Columns](#headers-provided-object-remove-column)
* [`quoteColumns`](#examples-quote-columns)
* [`quoteHeaders`](#examples-quote-headers)
* [Transforming Rows](#examples-transforming)
* [Appending To A CSV](#examples-appending)

<a name="examples-alternate-delimiter"></a>
### Alternate `delimiter`

You can change the default delimiter `,` by specifying the `delimiter` option

[`examples/delimiter_option.example.ts`](./examples/delimiter_option.example.ts)

```sh
npm run example -- delimiter_option
```

```typescript
import { format } from '@fast-csv/format';

const stream = format({ delimiter: '\t' });
stream.pipe(process.stdout);

stream.write(['a', 'b']);
stream.write(['a1', 'b1']);
stream.write(['a2', 'b2']);
stream.end();
```

Expected output

```
a\tb
a1\tb1
a2\tb2
```

---
<a name="examples-alternate-row-delimiter"></a>
### Alternate `rowDelimiter`

You can change the default row delimiter `\n` by specifying the `rowDelimiter` option.

[`examples/row_delimiter_option.example.ts`](./examples/row_delimiter_option.example.ts)

```sh
npm run example -- row_delimiter_option
```

```typescript
import { format } from '@fast-csv/format';

const stream = format({ rowDelimiter: '||' });
stream.pipe(process.stdout);

stream.write(['a', 'b']);
stream.write(['a1', 'b1']);
stream.write(['a2', 'b2']);
stream.end();
```

Expected output

```
a,b
a1,b1
a2,b2
```

---
<a name="examples-alternate-quote"></a>
### Alternate `quote`

You change change the default quote `"` option by specifying the `quote` option.

[`examples/quote_option.example.ts`](./examples/quote_option.example.ts)

```sh
npm run example -- quote_option
```

```typescript
import { format } from '@fast-csv/format';

const stream = format({ quote: "'" });
stream.pipe(process.stdout);

// each field will be quoted because it contains a delimiter
stream.write(['a,a', 'b,b']);
stream.write(['a1,a1', 'b1,b1']);
stream.write(['a2,a2', 'b2,b2']);
stream.end();
```

Expected output

```
'a,a','b,b'
'a1,a1','b1,b1'
'a2,a2','b2,b2'
```

---
<a name="examples-alternate-escape"></a>
### Alternate `escape`

You change change the default escape `"` option by specifying the `escpae` option.

[`examples/escape_option.example.ts`](./examples/escape_option.example.ts)

```sh
npm run example -- escape_option
```

```typescript
import { format } from '@fast-csv/format';

const stream = format({ escape: "'" });
stream.pipe(process.stdout);

// wrap each field in a quote so it is escaped and quoted
stream.write(['"a"', '"b"']);
stream.write(['"a1"', '"b1"']);
stream.write(['"a2"', '"b2"']);
stream.end();
```

Expected output

```
"'"a'"","'"b'""
"'"a1'"","'"b1'""
"'"a2'"","'"b2'""
```

---
<a name="examples-headers"></a>

### Headers

#### Auto Discovery

`fast-csv` will auto-discover headers when the `headers` option is set to `true`.

**NOTE** When working is one-dimensional array rows (e.g. `[ 'a', 'b', 'c' ]`) this is a no-op.

<a name="headers-auto-discover-object"></a>

[`examples/headers_auto_discovery_object.example.ts`](./examples/headers_auto_discovery_object.example.ts)

In this example the headers are auto-discovered from the objects passed in.

```sh
npm run example -- headers_auto_discovery_object
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: true });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value1b' });
csvStream.write({ header1: 'value2a', header2: 'value2b' });
csvStream.write({ header1: 'value3a', header2: 'value3b' });
csvStream.write({ header1: 'value4a', header2: 'value4b' });
csvStream.end();
```

Expected Output: 
```
header1,header2
value1a,value1b
value2a,value2b
value3a,value3b
value4a,value4b
```

<a name="headers-auto-discover-hash-array"></a>

[`examples/headers_auto_discovery_hash_array.example.ts`](./examples/headers_auto_discovery_hash_array.example.ts)

In this example the headers are auto-discovered from the hash arrays passed in.

```sh
npm run example -- headers_auto_discovery_hash_array
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: true });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write([
    ['header1', 'value1a'],
    ['header2', 'value1b'],
]);
csvStream.write([
    ['header1', 'value2a'],
    ['header2', 'value2b'],
]);
csvStream.write([
    ['header1', 'value3a'],
    ['header2', 'value3b'],
]);
csvStream.write([
    ['header1', 'value4a'],
    ['header2', 'value4b'],
]);
csvStream.end();
```

Expected Output: 
```
header1,header2
value1a,value1b
value2a,value2b
value3a,value3b
value4a,value4b
```

### Provided Headers

You can also provide a set of `headers` by providing an array. This allows you to 

* Reorder and/or exclude columns when working when object rows.
* Rename  and/or exclude columns when working with hash array rows.
* Specify headers or remove columns when working with array rows.

**NOTE** When working with objects the header names should match keys. The headers option allows you to specify column order.

<a name="headers-provided-array"></a>

[`examples/headers_provided_array.example.ts`](./examples/headers_provided_array.example.ts)

In this example a custom set of headers is provided for rows that are arrays.

```sh
npm run example -- headers_provided_array
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: ['header1', 'header2'] });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write(['value1a', 'value1b']);
csvStream.write(['value2a', 'value2b']);
csvStream.write(['value3a', 'value3b']);
csvStream.write(['value4a', 'value4b']);
csvStream.end();
```

Expected Output: 
```
header1,header2
value1a,value1b
value2a,value2b
value3a,value3b
value4a,value4b
```

<a name="headers-provided-hash-array"></a>

[`examples/headers_provided_hash_array.example.ts`](./examples/headers_provided_hash_array.example.ts)

In this example the headers are overridden with a custom set of headers

```sh
npm run example -- headers_provided_hash_array
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: ['header1', 'header2'] });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write([
    ['h1', 'value1a'],
    ['h2', 'value1b'],
]);
csvStream.write([
    ['h1', 'value2a'],
    ['h2', 'value2b'],
]);
csvStream.write([
    ['h1', 'value3a'],
    ['h2', 'value3b'],
]);
csvStream.write([
    ['h1', 'value4a'],
    ['h2', 'value4b'],
]);
csvStream.end();
```

Expected Output: 
```
header1,header2
value1a,value1b
value2a,value2b
value3a,value3b
value4a,value4b
```

<a name="headers-provided-object"></a>
[`examples/headers_provided_object.example.ts`](./examples/headers_provided_object.example.ts)

In this example the columns are reordered.

```sh
npm run example -- headers_provided_object
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: ['header2', 'header1'] });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value1b' });
csvStream.write({ header1: 'value2a', header2: 'value2b' });
csvStream.write({ header1: 'value3a', header2: 'value3b' });
csvStream.write({ header1: 'value4a', header2: 'value4b' });
csvStream.end();

```

Expected Output: 
```
header2,header1
value1b,value1a
value2b,value2a
value3b,value3a
value4b,value4a
```

<a name="headers-provided-object-remove-column"></a>
[`examples/headers_provided_object_remove_column.example.ts`](./examples/headers_provided_object_remove_column.example.ts)

In this example the one of the columns is removed.

```sh
npm run example -- headers_provided_object_remove_column
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: ['header2'] });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value1b' });
csvStream.write({ header1: 'value2a', header2: 'value2b' });
csvStream.write({ header1: 'value3a', header2: 'value3b' });
csvStream.write({ header1: 'value4a', header2: 'value4b' });
csvStream.end();
```

Expected Output: 
```
header2
value1b
value2b
value3b
value4b
```

---
<a name="examples-quote-columns"></a>
### `quoteColumns`

Sometimes you may need to quote columns is certain ways in order to meet certain requirements. `fast-csv` can quote columns and headers almost anyway you may need.

Setting `quoteColumns` to true will by default quote all columns and headers.

[`examples/quote_all_columns.example.ts`](./examples/quote_all_columns.example.ts)

```sh
npm run example -- quote_all_columns
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: true, quoteColumns: true });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected output

```
"header1","header2"
"value1a","value2a"
"value1a","value2a"
"value1a","value2a"
"value1a","value2a"
```

Setting `quoteColumns` to a `boolean[]` will quote the columns thats are set to true at each index in the array.

[`examples/quote_columns_array.example.ts`](./examples/quote_columns_array.example.ts)

```sh
npm run example -- quote_columns_array
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: ['header1', 'header2'], quoteColumns: [false, true] });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected output

```
header1,"header2"
value1a,"value2a"
value1a,"value2a"
value1a,"value2a"
value1a,"value2a"
```

Setting `quoteColumns` to a `{[string]: boolean}` will quote the columns that are in the object with a value of true

[`examples/quote_columns_object.example.ts`](./examples/quote_columns_object.example.ts)

```sh
npm run example -- quote_columns_object
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: true, quoteColumns: { header2: true } });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected output

```
header1,"header2"
value1a,"value2a"
value1a,"value2a"
value1a,"value2a"
value1a,"value2a"
```

If you need to quote columns and not headers you can set `quoteHeaders` to `null` or using the set it to a different configuration.

[`examples/quote_columns_not_headers.example.ts`](./examples/quote_columns_not_headers.example.ts)

```sh
npm run example -- quote_columns_not_headers
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: true, quoteColumns: { header2: true }, quoteHeaders: false });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();

```

Expected output.

```
header1,header2
value1a,"value2a"
value1a,"value2a"
value1a,"value2a"
value1a,"value2a"
```

---
<a name="examples-quote-headers"></a>
### `quoteHeaders`

The `quoteHeaders` option uses the same types as `quoteColumns`.

[`examples/quote_all_headers.example.ts`](./examples/quote_all_headers.example.ts)

```sh
npm run example -- quote_all_headers
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: true, quoteHeaders: true });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected output:

```
"header1","header2"
value1a,value2a
value1a,value2a
value1a,value2a
value1a,value2a
```

[`examples/quote_headers_array.example.ts`](./examples/quote_headers_array.example.ts)

```sh
npm run example -- quote_headers_array
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: ['header1', 'header2'], quoteHeaders: [false, true] });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected output:
```
header1,"header2"
value1a,value2a
value1a,value2a
value1a,value2a
value1a,value2a
```

[`examples/quote_headers_object.example.ts`](./examples/quote_headers_object.example.ts)

```sh
npm run example -- quote_headers_object
```

```typescript
import { format } from '@fast-csv/format';

const csvStream = format({ headers: true, quoteHeaders: { header2: true } });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected output:
```
header1,"header2"
value1a,value2a
value1a,value2a
value1a,value2a
value1a,value2a
```

---
<a name="examples-transforming"></a>
### Transforming Rows

You can transform rows by using the `.transform` method.

[`examples/transform.example.ts`](./examples/transform.example.ts)

```sh
npm run example -- transform
```

```typescript
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
```

Expected output

```
header1,header2
VALUE1A,VALUE2A
VALUE1A,VALUE2A
VALUE1A,VALUE2A
VALUE1A,VALUE2A
```

You can also specify your transform method as an option.

[`examples/transform_option.example.ts`](./examples/transform_option.example.ts)

```sh
npm run example -- transform_option
```

```typescript
import { format } from '@fast-csv/format';

interface CsvRow {
    header1: string;
    header2: string;
}

const transform = (row: CsvRow): CsvRow => ({
    header1: row.header1.toUpperCase(),
    header2: row.header2.toUpperCase(),
});

const csvStream = format({ headers: true, transform });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected output

```
header1,header2
VALUE1A,VALUE2A
VALUE1A,VALUE2A
VALUE1A,VALUE2A
VALUE1A,VALUE2A
```

Transform can also be async by accepting a callback.

[`examples/transform_async.example.ts`](./examples/transform_async.example.ts)

```sh
npm run example -- transform_async
```

```typescript
import { format } from '@fast-csv/format';

interface CsvRow {
    header1: string;
    header2: string;
}

const csvStream = format<CsvRow, CsvRow>({ headers: true }).transform((row, cb) => {
    setImmediate(() =>
        cb(null, {
            header1: row.header1.toUpperCase(),
            header2: row.header2.toUpperCase(),
        }),
    );
});

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected output

```
header1,header2
VALUE1A,VALUE2A
VALUE1A,VALUE2A
VALUE1A,VALUE2A
VALUE1A,VALUE2A
```

---
<a name="examples-appending"></a>
### Appending To A CSV

[`examples/append.example.ts`](./examples/append.example.ts)

```sh
npm run example -- append
```

In this example a new csv is created then appended to.

```typescript
import * as path from 'path';
import * as fs from 'fs';
import { FormatterOptionsArgs, Row, writeToStream } from '@fast-csv/format';

const write = (stream: NodeJS.WritableStream, rows: Row[], options: FormatterOptionsArgs<Row, Row>): Promise<void> => {
    return new Promise((res, rej) => {
        writeToStream(stream, rows, options)
            .on('error', err => rej(err))
            .on('finish', () => res());
    });
};

// create a new csv
const createCsv = (filePath: string, rows: Row[]): Promise<void> => {
    const csvFile = fs.createWriteStream(filePath);
    return write(csvFile, rows, { headers: true, includeEndRowDelimiter: true });
};

// append the rows to the csv
const appendToCsv = (filePath: string, rows: Row[] = []): Promise<void> => {
    const csvFile = fs.createWriteStream(filePath, { flags: 'a' });
    // notice how headers are set to false
    return write(csvFile, rows, { headers: false });
};

// read the file
const readFile = (filePath: string): Promise<Buffer> => {
    return new Promise((res, rej) => {
        fs.readFile(filePath, (err, contents) => {
            if (err) {
                return rej(err);
            }
            return res(contents);
        });
    });
};

const csvFilePath = path.resolve(__dirname, 'tmp', 'append.csv');

// 1. create the csv
createCsv(csvFilePath, [
    { a: 'a1', b: 'b1', c: 'c1' },
    { a: 'a2', b: 'b2', c: 'c2' },
    { a: 'a3', b: 'b3', c: 'c3' },
])
    // 2. append to the csv
    .then(() =>
        appendToCsv(csvFilePath, [
            { a: 'a4', b: 'b4', c: 'c4' },
            { a: 'a5', b: 'b5', c: 'c5' },
            { a: 'a6', b: 'b6', c: 'c6' },
        ]),
    )
    .then(() => readFile(csvFilePath))
    .then(contents => console.log(`${contents}`))
    .catch(err => {
        console.error(err.stack);
        process.exit(1);
    });
```

Expected output

```
a,b,c
a1,b1,c1
a2,b2,c2
a3,b3,c3
a4,b4,c4
a5,b5,c5
a6,b6,c6
```