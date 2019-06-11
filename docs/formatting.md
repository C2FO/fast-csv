# Formatting

* [Options](#parsing-options)
* [Valid Rows Types](#valid-row-types)
* [Formatting Methods](#formatting-methods)
  * [`csv.format`](#csv-format)
  * [`csv.write`](#csv-write)
  * [`csv.writeToStream`](#csv-write-to-stream)
  * [`csv.writeToBuffer`](#csv-write-to-buffer)
  * [`csv.writeToString`](#csv-write-to-string)
  * [`csv.writeToPath`](#csv-write-to-path)
* [Examples](#examples)
    * [Alternate `delimiter`](#examples-alternate-delimiter)
    * [Alternate `rowDelimiter`](#examples-alternate-row-delimiter)
    * [Alternate `quote`](#examples-alternate-quote)
    * [Alternate `escape`](#examples-alternate-escape)
    * [`quoteColumns`](#examples-quote-columns)
    * [`quoteHeaders`](#examples-quote-headers)
    * [Transforming Rows](#examples-transforming)

<a name="options"></a>
## Options

* `delimiter: {string} = ','`: Specify an alternate field delimiter such as `;` or `\t`.
   * **NOTE** When specifying an alternate `delimiter` you may only pass in a single character delimiter
* `rowDelimiter: {string} = '\n'`: Specify an alternate row delimiter (i.e `\r\n`)
* `quote: {string} = '"'`: The character to use to quote fields that contain a delimiter. If you set to `null` then all quoting will be ignored.
  * `"first,name",last name`
* `escape: {string} = '"'`: The character to use when escaping a value that is `quoted` and contains a `quote` character that is not the end of the field.
    * `i.e`: `First,"Name"' => '"First,""Name"""`
* `includeEndRowDelimiter: {boolean} = false`: Set to `true` to include a row delimiter at the end of the csv.
* `headers: {null|boolean|string[]} = null`:
  *  If true then the headers will be auto detected from the first row. 
    * If the row is an object then the keys will be used.
    * If the row is an array of two element arrays (`[ ['header', 'column'], ['header2', 'column2'] ]`) then the first element in each array will be used.
  *  If there is not a headers row and you want to provide one then set to a `string[]`
* `quoteColumns: {boolean|boolean[]|{[string]: boolean} = false`
   * If `true` then columns and headers will be quoted (unless `quoteHeaders` is specified).
   * If it is an object then each key that has a true value will be quoted ((unless `quoteHeaders` is specified)
   * If it is an array then each item in the array that is true will have the column at the corresponding index quoted (unless `quoteHeaders` is specified)
   * **NOTE** if `quoteHeaders` is not specified this option will apply to both columns and headers.
* `quoteHeaders: {boolean|boolean[]|{[string]: boolean} = quoteColumns`
   * Defaults to the `quoteColumns` option.
   * If `true` then all headers will be quoted.
   * If it is an object then each key that has a true value will be quoted (see example below)
   * If it is an array then each item in the array that is true will have the header at the corresponding index quoted (see example below)
* `transform: {(row) => Row | (row, cb) => void} = null`: A function that accepts a row and returns a transformed one to be written, or your function can accept an optional callback to do async transformations.

<a name="valid-row-types"></a>
## Valid Row Types

When creating a CSV `fast-csv` supports a few row formats.

**`{[string]: any}`**

You can pass in object to any formatter function if your CSV requires headers the keys of the first object will be used as the header names.

```javascript
{
  a: "a1",
  b: "b1",
  c: "c1",
}

//Generated CSV
//a,b,c
//a1,b1,c1
```

**`string[]`**

You can also pass in your rows as arrays. If your CSV requires headers the first row passed in will be the headers used.

```javascript
[
    ["a", "b", "c"],
    ["a1", "b1", "c1"]
]
//Generated CSV
//a,b,c
//a1,b1,c1
```

**`[string, any][]`**

This is the least commonly used format but can be useful if you have requirements to generate a CSV with headers with the same column name (Crazy we know but we have seen it).

```javascript
[
    [
        ["a", "a1"],
        ["a", "a2"],
        ["b", "b1"],
        ["b", "b2"],
        ["c", "c1"],
        ["c", "c2"]
    ]
]

//Generated CSV
//a,a,b,b,c,c
//a1,a2,b1,b2,c1,c2
```

<a name="formatting-methods"></a>
## Formatting Methods

<a name="csv-format"></a>
**`csv.format(options): CsvFormatterStream`**

This is the main entry point for formatting CSVs. It is used by all other helper methods.

```javascript
const stream = csv.format();
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

<a name="csv-write"></a>
**`write(rows[, options]): CsvFormatterStream`**

Create a formatter, writes the rows and returns the `CsvFormatterStream`.

```javascript
const rows = [
    [ 'a', 'b' ],
    [ 'a1', 'b1' ],
    [ 'a2', 'b2' ],
];
csv.write(rows).pipe(process.stdout);
```

Expected output

```
a,b
a1,b1
a2,b2
```

<a name="csv-write-to-stream"></a>
**`writeToStream(stream, rows[, options])`**

Write an array of values to a `WritableStream`, and returns the original stream

```javascript
const rows = [
    [ 'a', 'b' ],
    [ 'a1', 'b1' ],
    [ 'a2', 'b2' ],
];
csv.writeToStream(process.stdout, rows);

```

Expected output

```
a,b
a1,b1
a2,b2
```

<a name="csv-write-to-path"></a>
**`writeToPath(path, rows[, options])`**

Write an array of values to the specified path

```javascript
const rows = [
    [ 'a', 'b' ],
    [ 'a1', 'b1' ],
    [ 'a2', 'b2' ],
];
csv.writeToPath(path.resolve(__dirname, 'tmp.csv'), rows)
    .on('error', err => console.error(err))
    .on('finish', () => console.log('Done writing.'));

```

Expected file content

```
a,b
a1,b1
a2,b2
```

<a name="csv-write-to-string"></a>
**`writeToString(arr[, options]): Promise<string>`**

Formats the rows and returns a `Promise` that will resolve with the CSV content as a `string`.

```javascript
const rows = [
    [ 'a', 'b' ],
    [ 'a1', 'b1' ],
    [ 'a2', 'b2' ],
];
csv.writeToString(rows).then(data => console.log(data));
```

<a name="csv-write-to-buffer"></a>
**`writeToBuffer(arr[, options]): Promise<Buffer>`**

Formats the rows and returns a `Promise` that will resolve with the CSV content as a `Buffer`.

```javascript
const rows = [
    [ 'a', 'b' ],
    [ 'a1', 'b1' ],
    [ 'a2', 'b2' ],
];
csv.writeToBuffer(rows).then(data => console.log(data.toString()));
```


<a name="examples"></a>
## Examples

<a name="examples-alternate-delimiter"></a>
### Alternate `delimiter`

You can change the default delimiter `,` by specifying the `delimiter` option

[`examples/formatting/delimiter_option.example.js`](../examples/formatting/delimiter_option.example.js)
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

<a name="examples-alternate-row-delimiter"></a>
### Alternate `rowDelimiter`

You can change the default row delimiter `\n` by specifying the `rowDelimiter` option.

[`examples/formatting/row_delimiter_option.example.js`](../examples/formatting/row_delimiter_option.example.js)

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

<a name="examples-alternate-quote"></a>
### Alternate `quote`

You change change the default quote `"` option by specifying the `quote` option.

[`examples/formatting/quote_option.example.js`](../examples/formatting/quote_option.example.js)

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

<a name="examples-alternate-escape"></a>
### Alternate `escape`

You change change the default escape `"` option by specifying the `escpae` option.

[`examples/formatting/escape_option.example.js`](../examples/formatting/escape_option.example.js)

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

<a name="examples-quote-columns"></a>
### `quoteColumns`

Sometimes you may need to quote columns is certain ways in order to meet certain requirements. `fast-csv` can quote columns and headers almost anyway you may need.

Setting `quoteColumns` to true will by default quote all columns and headers.

[`examples/formatting/quote_all_columns.example.js`](../examples/formatting/quote_all_columns.example.js)

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

[`examples/formatting/quote_all_columns_array.example.js`](../examples/formatting/quote_all_columns_array.example.js)

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

[`examples/formatting/quote_all_columns_object.example.js`](../examples/formatting/quote_all_object.example.js)

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

[`examples/formatting/quote_all_columns_not_headers.example.js`](../examples/formatting/quote_all_columns_not_headers.example.js)

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

<a name="examples-quote-headers"></a>
### `quoteHeaders`

The `quoteHeaders` option uses the same types as `quoteColumns`.

[`examples/formatting/quote_all_headers.example.js`](../examples/formatting/quote_all_object.example.js)
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

[`examples/formatting/quote_headers_array.example.js`](../examples/formatting/quote_headers_array.example.js)
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

[`examples/formatting/quote_headers_object.example.js`](../examples/formatting/quote_headers_object.example.js)
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

<a name="examples-transforming"></a>
### Transforming Rows

You can transform rows by using the `.transform` method.

[`examples/formatting/transform.example.js`](../examples/formatting/transform.example.js)

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

[`examples/formatting/transform_option.example.js`](../examples/formatting/transform_option.example.js)

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

[`examples/formatting/transform_async.example.js`](../examples/formatting/transform_async.example.js)

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