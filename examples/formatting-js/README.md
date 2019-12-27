`@fast-csv/format` javascript formatting examples.

## Usage

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
  * Write Headers
    *  [Auto Discovered Headers](#write-headers-auto-discover)
    *  [Provided Headers](#write-headers-provided-headers)
* [`quoteColumns`](#examples-quote-columns)
* [`quoteHeaders`](#examples-quote-headers)
* [Transforming Rows](#examples-transforming)
* [Appending To A CSV](#examples-appending)

<a name="examples-alternate-delimiter"></a>
### Alternate `delimiter`

You can change the default delimiter `,` by specifying the `delimiter` option

[`examples/delimiter_option.example.js`](./examples/delimiter_option.example.js)

```sh
npm run example -- delimiter_option
```

```javascript
const stream = csv.format({ delimiter: '\t' });
stream.pipe(process.stdout);

stream.write([ 'a', 'b' ]);
stream.write([ 'a1', 'b1' ]);
stream.write([ 'a2', 'b2' ]);
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

[`examples/row_delimiter_option.example.js`](./examples/row_delimiter_option.example.js)

```sh
npm run example -- row_delimiter_option
```

```javascript
const stream = csv.format({ rowDelimiter: '\r\n' });
stream.pipe(process.stdout);

stream.write([ 'a', 'b' ]);
stream.write([ 'a1', 'b1' ]);
stream.write([ 'a2', 'b2' ]);
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

[`examples/quote_option.example.js`](./examples/quote_option.example.js)

```sh
npm run example -- quote_option
```

```javascript
const stream = csv.format({ quote: "'" });
stream.pipe(process.stdout);

// each field will be quoted because it contains a delimiter
stream.write([ 'a,a', 'b,b' ]);
stream.write([ 'a1,a1', 'b1,b1' ]);
stream.write([ 'a2,a2', 'b2,b2' ]);
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

[`examples/escape_option.example.js`](./examples/escape_option.example.js)

```sh
npm run example -- escape_option
```

```javascript
const stream = csv.format({ escape: "'" });
stream.pipe(process.stdout);

// wrap each field in a quote so it is escaped and quoted
stream.write([ '"a"', '"b"' ]);
stream.write([ '"a1"', '"b1"' ]);
stream.write([ '"a2"', '"b2"' ]);
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

[`examples/headers_auto_discovery_object.example.js`](./examples/headers_auto_discovery_object.example.js)

In this example the headers are auto-discovered from the objects passed in.

```sh
npm run example -- headers_auto_discovery_object
```

```js
const csvStream = csv.format({ headers: true});

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/headers_auto_discovery_hash_array.example.js`](./examples/headers_auto_discovery_hash_array.example.js)

In this example the headers are auto-discovered from the hash arrays passed in.

```sh
npm run example -- headers_auto_discovery_hash_array
```

```js
const csvStream = csv.format({ headers: true });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

csvStream.write([ [ 'header1', 'value1a' ], [ 'header2', 'value1b' ] ]);
csvStream.write([ [ 'header1', 'value2a' ], [ 'header2', 'value2b' ] ]);
csvStream.write([ [ 'header1', 'value3a' ], [ 'header2', 'value3b' ] ]);
csvStream.write([ [ 'header1', 'value4a' ], [ 'header2', 'value4b' ] ]);
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

[`examples/headers_provided_array.example.js`](./examples/headers_provided_array.example.js)

In this example a custom set of headers is provided for rows that are arrays.

```sh
npm run example -- headers_provided_array
```

```js
const csvStream = csv.format({ headers: [ 'header1', 'header2' ] });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

csvStream.write([ 'value1a', 'value1b' ]);
csvStream.write([ 'value2a', 'value2b' ]);
csvStream.write([ 'value3a', 'value3b' ]);
csvStream.write([ 'value4a', 'value4b' ]);
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

[`examples/headers_provided_hash_array.example.js`](./examples/headers_provided_hash_array.example.js)

In this example the headers are overridden with a custom set of headers

```sh
npm run example -- headers_provided_hash_array
```

```js
const csvStream = csv.format({ headers: [ 'header1', 'header2' ] });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

csvStream.write([ [ 'h1', 'value1a' ], [ 'h2', 'value1b' ] ]);
csvStream.write([ [ 'h1', 'value2a' ], [ 'h2', 'value2b' ] ]);
csvStream.write([ [ 'h1', 'value3a' ], [ 'h2', 'value3b' ] ]);
csvStream.write([ [ 'h1', 'value4a' ], [ 'h2', 'value4b' ] ]);
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
[`examples/headers_provided_object.example.js`](./examples/headers_provided_object.example.js)

In this example the columns are reordered.

```sh
npm run example -- headers_provided_object
```

```js
const csvStream = csv.format({ headers: [ 'header2', 'header1' ] });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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
[`examples/headers_provided_object_remove_column.example.js`](./examples/headers_provided_object_remove_column.example.js)

In this example the one of the columns is removed.

```sh
npm run example -- headers_provided_object_remove_column
```

```js
const csvStream = csv.format({ headers: [ 'header2' ] });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

### Write Headers

The `writeHeaders` option can be used to prevent writing headers, while still auto discovering them or providing them.

The `writeHeaders` option can be useful when appending to a csv to prevent writing headers twice. See the [append example](#examples-appending)


**NOTE** When writing array rows and headers is set to `true` then the first row will be not be written.

<a name="write-headers-auto-discover"></a>
[`examples/write_headers_auto_discover.example.js`](./examples/write_headers_auto_discover.example.js)

In this example the auto discovered headers are not written.

```sh
npm run example -- write_headers_auto_discover
```

```js
const csv = require('@fast-csv/format');

const csvStream = csv.format({ headers: true, writeHeaders: false });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected Output: 
```
value1a,value2a
value1a,value2a
value1a,value2a
value1a,value2a
```

<a name="write-headers-provided-headers"></a>
[`examples/write_headers_provided_headers.example.js`](./examples/write_headers_provided_headers.example.js)

In this example the headers are provided to specify order of columns but they are **not** written.

```sh
npm run example -- write_headers_provided_headers
```

```js
const csv = require('@fast-csv/format');

const csvStream = csv.format({ headers: ['header2', 'header1'], writeHeaders: false });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.write({ header1: 'value1a', header2: 'value2a' });
csvStream.end();
```

Expected Output: 
```
value2a,value1a
value2a,value1a
value2a,value1a
value2a,value1a
```

---
<a name="examples-quote-columns"></a>
### `quoteColumns`

Sometimes you may need to quote columns is certain ways in order to meet certain requirements. `fast-csv` can quote columns and headers almost anyway you may need.

Setting `quoteColumns` to true will by default quote all columns and headers.

[`examples/quote_all_columns.example.js`](./examples/quote_all_columns.example.js)

```sh
npm run example -- quote_all_columns
```

```javascript
const csvStream = csv.format({ headers: true, quoteColumns: true });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/quote_columns_array.example.js`](./examples/quote_columns_array.example.js)

```sh
npm run example -- quote_columns_array
```

```javascript
const csvStream = csv.format({ headers: [ 'header1', 'header2' ], quoteColumns: [ false, true ] });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/quote_columns_object.example.js`](./examples/quote_columns_object.example.js)

```sh
npm run example -- quote_columns_object
```

```javascript
const csvStream = csv.format({ headers: true, quoteColumns: { header2: true } });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/quote_columns_not_headers.example.js`](./examples/quote_columns_not_headers.example.js)

```sh
npm run example -- quote_columns_not_headers
```

```javascript
const csvStream = csv.format({ headers: true, quoteColumns: { header2: true }, quoteHeaders: false });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/quote_all_headers.example.js`](./examples/quote_all_headers.example.js)

```sh
npm run example -- quote_all_headers
```

```javascript
const csvStream = csv.format({ headers: true, quoteHeaders: true });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/quote_headers_array.example.js`](./examples/quote_headers_array.example.js)

```sh
npm run example -- quote_headers_array
```

```javascript
const csvStream = csv.format({ headers: [ 'header1', 'header2' ], quoteHeaders: [ false, true ] });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/quote_headers_object.example.js`](./examples/quote_headers_object.example.js)

```sh
npm run example -- quote_headers_object
```

```javascript
const csvStream = csv.format({ headers: true, quoteHeaders: { header2: true } });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/transform.example.js`](./examples/transform.example.js)

```sh
npm run example -- transform
```

```javascript
const csvStream = csv
    .format({ headers: true })
    .transform(row => ({
        header1: row.header1.toUpperCase(),
        header2: row.header2.toUpperCase(),
    }));

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/transform_option.example.js`](./examples/transform_option.example.js)

```sh
npm run example -- transform_option
```

```javascript
const transform = row => ({
    header1: row.header1.toUpperCase(),
    header2: row.header2.toUpperCase(),
});

const csvStream = csv.format({ headers: true, transform });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/transform_async.example.js`](./examples/transform_async.example.js)

```sh
npm run example -- transform_async
```

```javascript
const csvStream = csv
    .format({ headers: true })
    .transform((row, cb) => {
        setImmediate(() => cb(null, {
            header1: row.header1.toUpperCase(),
            header2: row.header2.toUpperCase(),
        }));
    });

csvStream
    .pipe(process.stdout)
    .on('end', process.exit);

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

[`examples/append.example.js`](./examples/append.example.js)

```sh
npm run example -- append
```

In this example a new csv is created then appended to.

```javascript
const path = require('path');
const fs = require('fs');
const csv = require('@fast-csv/format');

class CsvFile {
    static write(filestream, rows, options) {
        return new Promise((res, rej) => {
            csv.writeToStream(filestream, rows, options)
                .on('error', err => rej(err))
                .on('finish', () => res());
        });
    }

    constructor(opts) {
        this.headers = opts.headers;
        this.path = opts.path;
        this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true };
    }

    create(rows) {
        return CsvFile.write(fs.createWriteStream(this.path), rows, { ...this.writeOpts });
    }

    append(rows) {
        return CsvFile.write(fs.createWriteStream(this.path, { flags: 'a' }), rows, {
            ...this.writeOpts,
            // dont write the headers when appending
            writeHeaders: false,
        });
    }

    read() {
        return new Promise((res, rej) => {
            fs.readFile(this.path, (err, contents) => {
                if (err) {
                    return rej(err);
                }
                return res(contents);
            });
        });
    }
}

const csvFile = new CsvFile({
    path: path.resolve(__dirname, 'append.tmp.csv'),
    // headers to write
    headers: ['c', 'b', 'a'],
});

// 1. create the csv
csvFile
    .create([
        { a: 'a1', b: 'b1', c: 'c1' },
        { b: 'b2', a: 'a2', c: 'c2' },
        { a: 'a3', b: 'b3', c: 'c3' },
    ])
    // append rows to file
    .then(() =>
        csvFile.append([
            { a: 'a4', b: 'b4', c: 'c4' },
            { a: 'a5', b: 'b5', c: 'c5' },
        ]),
    )
    // append another row
    .then(() => csvFile.append([{ a: 'a6', b: 'b6', c: 'c6' }]))
    .then(() => csvFile.read())
    .then(contents => {
        console.log(`${contents}`);
    })
    .catch(err => {
        console.error(err.stack);
        process.exit(1);
    });
```

Expected output

```
c,b,a
c1,b1,a1
c2,b2,a2
c3,b3,a3
c4,b4,a4
c5,b5,a5
c6,b6,a6
```