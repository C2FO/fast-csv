# Parsing

* [Options](#parsing-options)
* [Events](#parsing-events)
* [Parsing Methods](#parsing-methods)
  * [`csv.parse`](#csv-parse)
  * [`csv.parseStream`](#csv-parse-stream)
  * [`csv.parseFile`](#csv-parse-path)
  * [`csv.parseString`](#csv-parse-string)
* [Examples](#examples)
    * [Manual Write](#csv-parse-manual-write)
    * [Alternate Delimiters](#csv-parse-alternate-delimiters)
    * [First Row As Headers](#csv-parse-first-row-as-headers)
    * [Custom Headers](#csv-parse-custom-headers)
    * [Renaming Headers](#csv-parse-renaming-headers)
    * [Skipping Columns](#csv-parse-skipping-columns)
    * [Ignoring Empty Rows](#csv-parse-ignoring-empty-rows)
    * [Transforming Rows](#csv-parse-transforming)
    * [Validating Rows](#csv-parse-validation)

<a name="parsing-options"></a>
## Options

* `objectMode: {boolean} = true`: Ensure that `data` events have an object emitted rather than the stringified version set to false to have a stringified buffer.
* `delimiter: {string} = ','`: If your data uses an alternate delimiter such as `;` or `\t`.
   * **NOTE** When specifying an alternate `delimiter` you may only pass in a single character delimiter
* `quote: {string} = '"'`: The character to use to quote fields that contain a delimiter. If you set to `null` then all quoting will be ignored.
  * `"first,name",last name`
* `escape: {string} = '"'`: The character to used tp escape quotes inside of a quoted field.
    * `i.e`: `First,"Name"' => '"First,""Name"""`
* `headers: {boolean|string[]} = false`:
  *  If you want the first row to be treated as headers then set to `true`
  *  If there is not a headers row and you want to provide one then set to a `string[]`
  *  If you wish to discard the first row and use your own headers set to a `string[]` and set the `renameHeaders` option to `true`
* `renameHeaders: {boolean} = false`: If you want the first line of the file to be removed and replaced by the one provided in the `headers` option.
  * **NOTE** This option should only be used if the `headers` option is a `string[]`
* `ignoreEmpty: {boolean} = false`: If you wish to ignore empty rows.
  * **NOTE** this will discard columns that are all white space or delimiters.
* `comment: {string} = null`: If your CSV contains comments you can use this option to ignore lines that begin with the specified character (e.g. `#`).
* `discardUnmappedColumns: {boolean} = false`: If you want to discard columns that do not map to a header.
  * **NOTE** this is only valid in the case that there are headers and the number of fields parsed is greater than the number of header fields.
* `comment:  
* `strictColumnHandling: {boolean} = false`: If you want to consider empty lines/lines with too few fields as invalid and emit a `data-invalid` event 
  * **NOTE** This option is only considered when `headers` are present.
* `trim: {boolean} = false`: Set to `true` to trim all fields
* `rtrim: {boolean} = false`: Set to `true` to right trim all fields.
* `ltrim: {boolean} = false`: Set to `true` to left trim all fields.

<a name="parsing-events"></a>
## Events

* `data`: Emitted when a record is parsed.
  * If headers are present then all rows will be an object.
  * If headers are not present then all rows will be an array.
  * **NOTE** if `objectMode` is set to false then all rows will be a buffer with a JSON row.
* `data-invalid`: Emitted if there was invalid row encounted;
  * Emitted when a `validate` function is provided and an invalid row is encountered.
  * Emitted when `strictColumnHandling` is `true` and a row with a different number of fields than headers is encountered.

<a name="parsing-methods"></a>
## Methods

<a name="csv-parse"></a>
**`csv.parse([options]): CsvParserStream`**

Creates a Csv Parsing Stream that can be piped or written to. 

This is the main entrypoint and is used by all the other parsing helpers.

```javascript

//creates a stream you can pipe 
const stream = csv.parse()

stream
  .on('error', error => console.error(error))
  .on('data', row => console.log(row))
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
```

To pipe to the stream from a file you can do the following.

```javascript
const csv = require('fast-csv');

fs.createReadStream('my.csv')
    .pipe(csv.parse())
    .on('error', error => console.error(error))
    .on('data', row => console.log(`ROW=${JSON.stringify(row)}`))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
```

```javascript
const csv = require('fast-csv');

const fileStream = fs.createReadStream("my.csv");
const parser = csv.parse();

fileStream
    .pipe(parser)
    .on('error', error => console.error(error))
    .on('readable', () => {
       for (let row = parser.read(); row; row = parser.read()) {
            console.log(`ROW=${JSON.stringify(row)}`);
        }
    })
    .on('end', (rowCount) => console.log(`Parsed ${rowCount} rows`));
```

<a name="csv-parse-stream"></a>
**`csv.parseStream(readableStream[, options]): CsvParserStream`**

Accepts a readable stream and pipes it to a `CsvParserStream`. 

```javascript
const stream = fs.createReadStream('./path/to/my.csv');

csv
  .parseStream(stream)
  .on('error', error => console.error(error))
  .on('data', row => console.log(row))
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
    
```

<a name="csv-parse-path"></a>
**`csv.parseFile(path[, options]): CsvParserStream`**

Parses a file from the specified path and returns the `CsvParserStream`.

```javascript
const csv = require('fast-csv');

csv
  .parseFile('./path/to/my.csv')
  .on('error', error => console.error(error))
  .on('data', row => console.log(row))
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
```

<a name="csv-parse-string"></a>
**`csv.parseString(string[, options]): CsvParserStream`**

This method parses a string and returns the `CsvParserStream`.

```javascript
const { EOL } = require('os');
const csv = require('fast-csv');

const CSV_STRING = [
    'a,b',
    'a1,b1',
    'a2,b2',
].join(EOL);

csv
    .fromString(CSV_STRING, { headers: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
```

<a name="examples"></a>
## Examples

All of the examples below can be found in [examples/parsing](../examples/parsing) directory.

<a name="csv-parse-piping"></a>


<a name="csv-parse-manual-write"></a>
### Manual Write

[`examples/parsing/manual_write.example.js`](../examples/parsing/manual_write.examples.js)

```javascript
const csv = require('fast-csv');

const stream = csv.parse({ headers: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write('header1,header2\n');
stream.write('col1,col2');
stream.end();

```

Expected output

```
{ header1: 'col1', header2: 'col2' }
Parsed 1 rows
```

<a name="csv-parse-alternate-delimiters"></a>
### Alternate Delimiter

You can provide a `delimiter` option to change the delimiter from a `,` character.

[`examples/parsing/alternate_delimiter.example.js`](../examples/parsing/alternate_delimiter.examples.js)

```javascript
const CSV_STRING = [
    'a1\tb1',
    'a2\tb2',
].join(EOL);

const stream = csv
    .parse({ delimiter: '\t' })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();
```

Expected output

```
[ 'a1', 'b1' ]
[ 'a2', 'b2' ]
Parsed 2 rows
```

<a name="csv-parse-first-row-as-headers"></a>
### First Row As Headers

If you expect the first line your CSV to be headers you may pass in a `headers` option. 

Setting the `headers` option to `true` will cause change each row to an object rather than an array.

[`examples/parsing/first_row_as_headers.example.js`](../examples/parsing/first_row_as_headers.example.js)

```javascript
const { EOL } = require('os');

const CSV_STRING = [
    'a,b',
    'a1,b1',
    'a2,b2',
].join(EOL);

const stream = csv
  .parse({ headers: true })
  .on('error', error => console.error(error))
  .on('data', row => console.log(row))
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();
```

Expected output
```
{ a: 'a1', b: 'b1' }
{ a: 'a2', b: 'b2' }
Parsed 2 rows
```

<a name="csv-parse-custom-headers"></a>
### Custom Headers

You may alternatively pass an array of header names.

**NOTE** The order of the headers array will should match the order of fields in the CSV, otherwise the data columns will not match.

[`examples/parsing/custom_headers.example.js`](../examples/parsing/custom_headers.example.js)

```javascript
const { EOL } = require('os');

const CSV_STRING = [
    'a1,b1',
    'a2,b2',
].join(EOL);

const stream = csv
    .parse({ headers: [ 'a', 'b' ] })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();

```

Expected output

```
{ a: 'a1', b: 'b1' }
{ a: 'a2', b: 'b2' }
Parsed 2 rows
```

<a name="csv-parse-renaming-headers"></a>
### Renaming Headers

If the CSV contains a header row but you want to provide custom headers you can pass an array of headers, and set `renameHeaders` to true.

[`examples/parsing/rename_headers.example.js`](../examples/parsing/rename_headers.example.js)

```javascript
const { EOL } = require('os');

const CSV_STRING = [
    'header1,header2',
    'a1,b1',
    'a2,b2',
].join(EOL);

const stream = csv
    .parse({ headers: [ 'a', 'b' ], renameHeaders: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();

```

Expected output

```
{ a: 'a1', b: 'b1' }
{ a: 'a2', b: 'b2' }
Parsed 2 rows
```

<a name="csv-parse-skipping-columns"></a>
### Skipping Columns

To omit some of the data columns you may not need, pass a sparse array as `headers`.

[`examples/parsing/skipping_columns.example.js`](../examples/parsing/skipping_columns.example.js)

```javascript
const CSV_STRING = [
    'a1,b1,c1',
    'a2,b2,c2',
].join(EOL);

const stream = csv
    .parse({ headers: [ 'a', undefined, 'c' ] })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();

```

Expected output

```
{ a: 'a1', c: 'c1' }
{ a: 'a2', c: 'c2' }
Parsed 2 rows
```

<a name="csv-parse-ignoring-empty-rows"></a>
### Ignoring Empty Rows

If your data includes empty rows, the sort Excel might include at the end of the file for instance, you can ignore these by including the `ignoreEmpty` option.

Any rows consisting of nothing but empty strings and/or commas will be skipped, without emitting a 'data', 'data-invalid', or 'error' event.

[`examples/parsing/ignore_empty_rows.example.js`](../examples/parsing/ignore_empty_rows.example.js)

```javascript
const CSV_STRING = [
    'a1,b1',
    ',',      //empty row empty colums
    'a2,b2',
    '   ,\t', //empty row columns with just white space
    '',       //empty last line
].join(EOL);

const stream = csv
    .parse({ ignoreEmpty: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();

```

Expected output

```
[ 'a1', 'b1' ]
[ 'a2', 'b2' ]
Parsed 2 rows
```

<a name="csv-parse-transforming"></a>
### Transforming

You can transform data by providing a transform function. What is returned from the transform function will be provided to validate and emitted as a row.

[`examples/parsing/transform.example.js`](../examples/parsing/transform.example.js)

```javascript
const CSV_STRING = [
    'firstName,lastName',
    'bob,yukon',
    'sally,yukon',
    'timmy,yukon',
].join(EOL);

const stream = csv
    .parse({ headers: true })
    .transform(data => ({
        firstName: data.firstName.toUpperCase(),
        lastName: data.lastName.toUpperCase(),
        properName: `${data.firstName} ${data.lastName}`,
    }))
    .on('error', error => console.error(error))
    .on('data', row => console.log(JSON.stringify(row)))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();
```

Expected output

```
{"firstName":"BOB","lastName":"YUKON","properName":"bob yukon"}
{"firstName":"SALLY","lastName":"YUKON","properName":"sally yukon"}
{"firstName":"TIMMY","lastName":"YUKON","properName":"timmy yukon"}
Parsed 3 rows
```

`fast-csv` also supports async transformation with a callback.

[`examples/parsing/transform_async.example.js`](../examples/parsing/transform_async.example.js)

```javascript
const CSV_STRING = [
    'firstName,lastName',
    'bob,yukon',
    'sally,yukon',
    'timmy,yukon',
].join(EOL);

const stream = csv
    .parse({ headers: true })
    .transform((data, cb) => {
        setImmediate(() => cb(null, {
            firstName: data.firstName.toUpperCase(),
            lastName: data.lastName.toUpperCase(),
            properName: `${data.firstName} ${data.lastName}`,
        }));
    })
    .on('error', error => console.error(error))
    .on('data', row => console.log(JSON.stringify(row)))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();
```

Expected output

```
{"firstName":"BOB","lastName":"YUKON","properName":"bob yukon"}
{"firstName":"SALLY","lastName":"YUKON","properName":"sally yukon"}
{"firstName":"TIMMY","lastName":"YUKON","properName":"timmy yukon"}
Parsed 3 rows
```

<a name="csv-parse-validation"></a>
### Validation

You can validate each row in the CSV by providing a validate handler. If a row is invalid then a `data-invalid` event will be emitted with the row and the index.

[`examples/parsing/validate.example.js`](../examples/parsing/validate.example.js)

```javascript
const CSV_STRING = [
    'firstName,lastName',
    'bob,yukon',
    'sally,yukon',
    'timmy,yukon',
].join(EOL);

const stream = csv
    .parse({ headers: true })
    .validate(data => data.firstName !== 'bob')
    .on('error', error => console.error(error))
    .on('data', row => console.log(`Valid [row=${JSON.stringify(row)}]`))
    .on('data-invalid', (row, rowNumber) => console.log(`Invalid [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}]`))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();
```

Expected output

```
Invalid [rowNumber=1] [row={"firstName":"bob","lastName":"yukon"}]
Valid [row={"firstName":"sally","lastName":"yukon"}]
Valid [row={"firstName":"timmy","lastName":"yukon"}]
Parsed 2 rows
```

`fast-csv` also supports async validation, with a callback.

[`examples/parsing/validate_async.example.js`](../examples/parsing/validate_async.example.js)
```javascript
const CSV_STRING = [
    'firstName,lastName',
    'bob,yukon',
    'sally,yukon',
    'timmy,yukon',
].join(EOL);

const stream = csv.parse({ headers: true })
    .validate((row, cb) => {
        setImmediate(() => cb(null, row.firstName !== 'bob'));
    })
    .on('error', error => console.error(error))
    .on('data', row => console.log(`Valid [row=${JSON.stringify(row)}]`))
    .on('data-invalid', (row, rowNumber) => console.log(`Invalid [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}]`))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();
```

Expected output

```
Invalid [rowNumber=1] [row={"firstName":"bob","lastName":"yukon"}]
Valid [row={"firstName":"sally","lastName":"yukon"}]
Valid [row={"firstName":"timmy","lastName":"yukon"}]
Parsed 2 rows
```

Sometimes you may wish to provide a reason that the row was invalid, you can use the callback to provide additional info.

[`examples/parsing/validate_with_reason.example.js`](../examples/parsing/validate_with_reason.example.js)
```javascript
const CSV_STRING = [
    'firstName,lastName',
    'bob,yukon',
    'sally,yukon',
    'timmy,yukon',
].join(EOL);

const stream = csv.parse({ headers: true })
    .validate((row, cb) => {
        const isValid = row.firstName !== 'bob';
        if (!isValid) {
            return cb(null, false, 'Name is bob');
        }
        return cb(null, true);
    })
    .on('error', error => console.error(error))
    .on('data', row => console.log(`Valid [row=${JSON.stringify(row)}]`))
    .on('data-invalid', (row, rowNumber, reason) => {
        console.log(`Invalid [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}] [reason=${reason}]`);
    })
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();
```

Expected output

```
Invalid [rowNumber=1] [row={"firstName":"bob","lastName":"yukon"}] [reason=Name is bob]
Valid [row={"firstName":"sally","lastName":"yukon"}]
Valid [row={"firstName":"timmy","lastName":"yukon"}]
Parsed 2 rows
```

