/**
 * @projectName fast-csv
 * @github https://github.com/C2FO/fast-csv
 * @header
 * [![build status](https://secure.travis-ci.org/C2FO/fast-csv.png)](http://travis-ci.org/C2FO/fast-csv)
 * # Fast-csv
 *
 * This is a library is aimed at providing fast CSV parsing. It accomplishes this by not handling some of the more complex
 * edge cases such as multi line rows. However it does support escaped values, embedded commas, double and single quotes.
 *
 * ## Installation
 *
 * `npm install fast-csv`
 *
 * ## Usage
 *
 * ### Parsing
 *
 * All methods accept the following `options`
 *
 * * `headers=false`: Ste to true if you expect the first line of your `CSV` to contain headers, alternatly you can specify an array of headers to use.
 * * `ignoreEmpty=false`: If you wish to ignore empty rows.
 * * `delimiter=','`: If your data uses an alternate delimiter such as `;` or `\t`.
 *    * **NOTE** When specifying an alternate `delimiter` you may only pass in a single character delimeter
 *
 * **events**
 *
 * `parse-error`: Emitted if there was an error parsing a row.
 * `record`: Emitted when a record is parsed.
 * `data-invalid`: Emitted if there was invalid row encounted, **only emitted if the `validate` function is used**.
 * `data`: Emitted with the `stringified` version of a record.
 *
 * **([options])**
 *
 * If you use `fast-csv` as a function it returns a transform stream that can be piped into.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * var csvStream = csv()
 *  .on("record", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  });
 *
 * stream.pipe(csvStream);
 * ```
 *
 * **`.fromPath(path[, options])**
 *
 * This method parses a file from the specified path.
 *
 * ```javascript
 * var csv = require("fast-csv");
 *
 * csv
 *  .fromPath("my.csv")
 *  .on("record", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  });
 * ```
 *
 * **`.fromString(string[, options])**
 *
 * This method parses a string
 *
 * ```javascript
 * var csv = require("fast-csv");
 *
 * var CSV_STRING = 'a,b\n' +
 *                  'a1,b1\n' +
 *                  'a2,b2\n';
 *
 * csv
 *  .fromPath(CSV_STRING, {headers: true})
 *  .on("record", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  });
 * ```
 *
 * **`.fromStream(stream[, options])**
 *
 * This accepted a readable stream to parse data from.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv()
 *  .fromStream(stream)
 *  .on("record", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  });
 * ```
 *
 * If you expect the first line your csv to headers you may pass a headers option in. Setting the headers option will
 * cause change each row to an object rather than an array.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv()
 *  .fromStream(stream, {headers : true})
 *  .on("record", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  });
 *
 * ```
 *
 * You may alternatively pass an array of header names which must match the order of each column in the csv, otherwise
 * the data columns will not match.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv
 *  .fromStream(stream, {headers : ["firstName", "lastName", "address"]})
 *  .on("record", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  });
 *
 * ```
 *
 * If your data may include empty rows, the sort Excel might include at the end of the file for instance, you can ignore
 * these by including the `ignoreEmpty` option.
 *
 * Any rows consisting of nothing but empty strings and/or commas will be skipped, without emitting a 'data' or 'error' event.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv
 *  .fromStream(stream, {ignoreEmpty: true})
 *  .on("record", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  });
 *
 * ```
 *
 * ### Validating
 *
 * You can validate each row in the csv by providing a validate handler. If a row is invalid then a `data-invalid` event
 * will be emitted with the row and the index.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv(
 *  .fromStream(stream, {headers : true})
 *  .validate(function(data){
 *      return data.age < 50; //all persons must be under the age of 50
 *  })
 *  .on("data-invalid", function(data){
 *      //do something with invalid row
 *  })
 *  .on("record", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  });
 *
 * ```
 *
 * ### Transforming
 *
 * You can transform data by providing in a transform function. What is returned from the transform function will
 * be provided to validate and emitted as a row.
 *
 * ```javascript
 * var stream = fs.createReadStream("my.csv");
 *
 * csv
 *  .fromStream(stream)
 *  .transform(function(data){
 *      return data.reverse(); //reverse each row.
 *  })
 *  .on("record", function(data){
 *      console.log(data):
 *  })
 *  .on("end", function(){
 *      console.log("done");
 *  });
 *
 * ```
 *
 * ### Formatting
 *
 * `fast-csv` also allows to you to create create a `CSV` from data.
 *
 * In addition to the options for parsing you can specify the following additional options.
 *
 * * `quote='"'`: The character to use to escape values that contain a delimeter.
 * * `escape='"'`: The character to use when escaping a value that is `quoted` and constains a `quote` character.
 *     * `i.e`: 'First,"Name"' => '"First,""name"""'
 *
 * **Writing Data**
 *
 * Each of the following methods accept an array of values to be written, however each value must be an `array` of `array`s or `object`s.
 *
 * **`write(arr[, options])`**
 *
 * Create a readable stream to read data from.
 *
 * ```javascript
 * var ws = fs.createWritableStream("my.csv");
 * csv
 *    .write([
 *        ["a", "b"],
 *        ["a1", "b1"],
 *        ["a2", "b2"]
 *    ], {headers: true})
 *    .pipe(ws);
 * ```
 *
 * ```javascript
 * var ws = fs.createWritableStream("my.csv");
 * csv
 *    .write([
 *        {a: "a1", b: "b1"},
 *        {a: "a2", b: "b2"}
 *    ], {headers: true})
 *    .pipe(ws);
 * ```
 *
 * **`writeToStream(stream,arr[, options])`**
 *
 * Write an array of values to a `WritableStream`
 *
 * ```javascript
 * csv
 *    .writeToStream(fs.createWritableStream("my.csv"), [
 *        ["a", "b"],
 *        ["a1", "b1"],
 *        ["a2", "b2"]
 *    ], {headers: true});
 * ```
 *
 * ```javascript
 * csv
 *    .writeToStream(fs.createWritableStream("my.csv"), [
 *        {a: "a1", b: "b1"},
 *        {a: "a2", b: "b2"}
 *    ], {headers: true})
 *    .pipe(ws);
 * ```
 *
 * **`writeToPath(arr[, options])`**
 *
 * Write an array of values to the specified path
 *
 * ```javascript
 * csv
 *    .writeToPath("my.csv", [
 *        ["a", "b"],
 *        ["a1", "b1"],
 *        ["a2", "b2"]
 *    ], {headers: true})
 *    .on("finish", function(){
 *        console.log("done!");
 *    });
 * ```
 *
 * ```javascript
 * csv
 *    .writeToStream("my.csv", [
 *        {a: "a1", b: "b1"},
 *        {a: "a2", b: "b2"}
 *    ], {headers: true})
 *    .on("finish", function(){
 *       console.log("done!");
 *    });
 * ```
 *
 * **`writeToString(arr[, options])`**
 *
 * ```javascript
 * csv.writeToString([
 *    ["a", "b"],
 *    ["a1", "b1"],
 *    ["a2", "b2"]
 * ], {headers: true}); //"a,b\na1,b1\na2,b2\n"
 * ```
 *
 * ```javascript
 * csv.writeToString([
 *    {a: "a1", b: "b1"},
 *    {a: "a2", b: "b2"}
 * ], {headers: true}); //"a,b\na1,b1\na2,b2\n"
 * ```
 *
 * ## Benchmarks
 *
 * `Parsing 20000 records AVG over 3 runs`
 *
 * ```
 * fast-csv: 198.67ms
 * csv:      525.33ms
 * ```
 *
 * `Parsing 50000 records AVG over 3 runs`
 *
 * ```
 * fast-csv: 441.33ms
 * csv:      1291ms
 * ```
 *
 * `Parsing 100000 records AVG over 3 runs`
 *
 * ```
 * fast-csv: 866ms
 * csv:      2773.33ms
 * ```
 *
 * `Parsing 1000000 records AVG over 3 runs`
 *
 * ```
 * fast-csv: 8562.67ms
 * csv:      30030.67ms
 * ```
 *
 * ## License
 *
 * MIT <https://github.com/C2FO/fast-csv/raw/master/LICENSE>
 *
 * ##Meta
 * * Code: `git clone git://github.com/C2FO/fast-csv.git`
 * * Website: <http://c2fo.com>
 * * Twitter: [http://twitter.com/c2fo](http://twitter.com/c2fo) - 877.465.4045
 *
 */

var fs = require("fs"),
    extended = require("./extended"),
    hash = extended.hash,
    ParserStream = require("./parser_stream"),
    stream = require("stream"),
    formatter = require("./formatter");

function parse(options) {
    return new ParserStream(options);
}

parse.fromStream = function (stream, options) {
    return stream.pipe(new ParserStream(options));
};

parse.fromPath = function (location, options) {
    return fs.createReadStream(location).pipe(new ParserStream(options));
};

parse.fromString = function (string, options) {
    var rs = new stream.Readable();
    rs.push(string);
    rs.push(null);
    return rs.pipe(new ParserStream(options));
};

parse.toCsvStream = function (arr, options) {
    return formatter.writeToStream(arr, options);
};

parse.write = formatter.write;

parse.writeToStream = formatter.writeToStream;

parse.writeToString = formatter.writeToString;

parse.writeToPath = formatter.writeToPath;

module.exports = parse;

