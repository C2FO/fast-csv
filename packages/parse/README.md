# `@fast-csv/parse`

`fast-csv` package to parse CSVs.

## Installation

`npm i -S @fast-csv/parse`

## Usage

To use `fast-csv` in `javascript` you can require the module

```js
const csv = require('@fast-csv/parse');
```

To import with typescript 

```typescript
import * as format csv '@fast-csv/parse';
```

* [Options](#parsing-options)
* [Events](#parsing-events)
* [Parsing Methods](#parsing-methods)
  * [`csv.parse`](#csv-parse)
  * [`csv.parseStream`](#csv-parse-stream)
  * [`csv.parseFile`](#csv-parse-path)
  * [`csv.parseString`](#csv-parse-string)
* Examples
  * [JavaScript Examples](../../examples/parsing-js/README.md)
  * [TypeScript Examples](../../examples/parsing-ts/README.md)     

<a name="parsing-options"></a>
## Options

* `objectMode: {boolean} = true`: Ensure that `data` events have an object emitted rather than the stringified version set to false to have a stringified buffer.
* `delimiter: {string} = ','`: If your data uses an alternate delimiter such as `;` or `\t`.
   * **NOTE** When specifying an alternate `delimiter` you may only pass in a single character delimiter
* `quote: {string} = '"'`: The character to use to quote fields that contain a delimiter. If you set to `null` then all quoting will be ignored.
  * `"first,name",last name`
* `escape: {string} = '"'`: The character to used tp escape quotes inside of a quoted field.
    * `i.e`: `First,"Name"' => '"First,""Name"""`
* `headers: {boolean|string[]|(string[]) => string[])} = false`:
  *  If you want the first row to be treated as headers then set to `true`
  *  If there is not a headers row and you want to provide one then set to a `string[]`
  *  If you wish to discard the first row and use your own headers set to a `string[]` and set the `renameHeaders` option to `true`
  *  If you wish to transform the headers you can provide a transform function. 
      *  **NOTE** This will always rename the headers
  * **NOTE** If you specify headers and there are more columns than headers an error WILL NOT be emitted unless `strictColumnHandling` is set to `true`
  * **NOTE** If headers either parsed, provided or transformed are NOT unique, then an error will be emitted and the stream will stop parsing.
* `renameHeaders: {boolean} = false`: If you want the first line of the file to be removed and replaced by the one provided in the `headers` option. 
  * **NOTE** This option should only be used if the `headers` option is a `string[]`
  * **NOTE** If the `headers` option is a function then this option is always set to true.
* `ignoreEmpty: {boolean} = false`: If you wish to ignore empty rows.
  * **NOTE** this will discard columns that are all white space or delimiters.
* `comment: {string} = null`: If your CSV contains comments you can use this option to ignore lines that begin with the specified character (e.g. `#`).
* `discardUnmappedColumns: {boolean} = false`: If you want to discard columns that do not map to a header.
  * **NOTE** this is only valid in the case that there are headers and the number of fields parsed is greater than the number of header fields.
* `strictColumnHandling: {boolean} = false`: If you want to consider empty lines/lines with too few fields as invalid and emit a `data-invalid` event 
  * **NOTE** This option is only considered when `headers` are present.
* `trim: {boolean} = false`: Set to `true` to trim all fields
* `rtrim: {boolean} = false`: Set to `true` to right trim all fields.
* `ltrim: {boolean} = false`: Set to `true` to left trim all fields.
* `encoding: {string} = 'utf8'`: Passed to [StringDecoder](https://nodejs.org/api/string_decoder.html#string_decoder_new_stringdecoder_encoding) when decoding incoming buffers. Change if incoming content is not 'utf8' encoded.
* `maxRows: {number} = 0`: If number is `> 0` the specified number of rows will be parsed.(e.g. `100` would return the first 100 rows of data).
* `skipRows: {number} = 0`: If number is `> 0` the specified number of **parsed** rows will be skipped.
* `skipLines: {number} = 0`: If number is `> 0` the specified number of lines will be skipped.

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
    .parseString(CSV_STRING, { headers: true })
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
```




