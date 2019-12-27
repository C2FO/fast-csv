# `@fast-csv/format`

`fast-csv` package to create CSVs.

## Installation

`npm i -S @fast-csv/format`

## Usage

To use `fast-csv` in `javascript` you can require the module

```js
const csv = require('@fast-csv/format');
```

To import with typescript 

```typescript
import * as format csv '@fast-csv/format';
```

* [Options](#options)
* [Valid Rows Types](#valid-row-types)
* [Formatting Methods](#formatting-methods)
  * [`format`](#csv-format)
  * [`write`](#csv-write)
  * [`writeToStream`](#csv-write-to-stream)
  * [`writeToBuffer`](#csv-write-to-buffer)
  * [`writeToString`](#csv-write-to-string)
  * [`writeToPath`](#csv-write-to-path)
* Examples
    * [JavaScript Examples](../../examples/formatting-js/README.md)
    * [TypeScript Examples](../../examples/formatting-ts/README.md)

<a name="options"></a>
## Options

* `delimiter: {string} = ','`: Specify an alternate field delimiter such as `;` or `\t`.
   * **NOTE** When specifying an alternate `delimiter` you may only pass in a single character delimiter
* `rowDelimiter: {string} = '\n'`: Specify an alternate row delimiter (i.e `\r\n`)
* `quote: {string|boolean} = '"'`: 
  * If provided as a string it will be used to quote fields that contain a delimiter.
    * `"first,name",last name`
  * If `quote` is set to `true` the default quote will be used. 
    * **NOTE** This is the same as not providing the option
  * If `quote` false then quoting will be disabled 
    * **CAUTION** If your field could contain a delimiter then you may end up with extra columns         
* `escape: {string} = '"'`: The character to use when escaping a value that is `quoted` and contains a `quote` character that is not the end of the field.
    * `i.e`: `First,"Name"' => '"First,""Name"""`
* `includeEndRowDelimiter: {boolean} = false`: Set to `true` to include a row delimiter at the end of the csv.
* `writeBOM: {boolean} = false`: Set to true if you want the first character written to the stream to be a utf-8 BOM character.
* `headers: {null|boolean|string[]} = null`:
  *  If true then the headers will be auto detected from the first row. 
      * If the row is a one-dimensional array then headers is a no-op
      * If the row is an object then the keys will be used.
      * If the row is an array of two element arrays (`[ ['header', 'column'], ['header2', 'column2'] ]`) then the first element in each array will be used.
  *  If there is not a headers row and you want to provide one then set to a `string[]`
      * **NOTE** If the row is an object the headers must match fields in the object, otherwise you will end up with empty fields
      * **NOTE** If there are more headers than columns then additional empty columns will be added
* `writeHeaders: {boolean} = true`: Set to false you dont want to write headers.
  * If `headers` is set to `true` and `writeHeaders` is `false` then any auto discovered headers will not be written in the output.
  * If `headers` is an `array` and `writeHeaders` is `false` then they will not be written.  
  * **NOTE** This is can be used to append to an existing csv.
* `alwaysWriteHeaders: {boolean} = false`: Set to true if you always want headers written, even if no rows are written.
  * **NOTE** This will throw an error if headers are not specified as an array.
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