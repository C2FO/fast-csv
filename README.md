[![build status](https://secure.travis-ci.org/C2FO/fast-csv.png)](http://travis-ci.org/C2FO/fast-csv)
# Fast-csv

This is a library that provides CSV parsing and formatting.

**NOTE** As of v0.2.0 `fast-csv` supports multi-line values.

## Installation

`npm install fast-csv`

## Usage

### Parsing

All methods accept the following `options`

* `objectMode=true`: Ensure that `data` events have an object emitted rather than the stringified version set to false to have a stringified buffer.
* `headers=false`: Ste to true if you expect the first line of your `CSV` to contain headers, alternatly you can specify an array of headers to use.
* `ignoreEmpty=false`: If you wish to ignore empty rows.
* `delimiter=','`: If your data uses an alternate delimiter such as `;` or `\t`.
   * **NOTE** When specifying an alternate `delimiter` you may only pass in a single character delimiter
* `quote='"'`: The character to use to escape values that contain a delimiter.
* `escape='"'`: The character to use when escaping a value that is `quoted` and contains a `quote` character.
    * `i.e`: 'First,"Name"' => '"First,""name"""'
* The following are options for parsing only.
  * `trim=false`: If you want to trim all values parsed set to true.
  * `rtrim=false`: If you want to right trim all values parsed set to true.
  * `ltrim=false`: If you want to left trim all values parsed set to true.


**events**

* `record`: Emitted when a record is parsed.
* `data-invalid`: Emitted if there was invalid row encounted, **only emitted if the `validate` function is used**.
* `data`: Emitted with the object or `stringified` version if the `objectMode` is set to `false`.

**([options])**

If you use `fast-csv` as a function it returns a transform stream that can be piped into.

```javascript
var stream = fs.createReadStream("my.csv");

var csvStream = csv()
 .on("record", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 });

stream.pipe(csvStream);
```

**`.fromPath(path[, options])`**

This method parses a file from the specified path.

```javascript
var csv = require("fast-csv");

csv
 .fromPath("my.csv")
 .on("record", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 });
```

**`.fromString(string[, options])`**

This method parses a string

```javascript
var csv = require("fast-csv");

var CSV_STRING = 'a,b\n' +
                 'a1,b1\n' +
                 'a2,b2\n';

csv
 .fromPath(CSV_STRING, {headers: true})
 .on("record", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 });
```

**`.fromStream(stream[, options])`**

This accepted a readable stream to parse data from.

```javascript
var stream = fs.createReadStream("my.csv");

csv()
 .fromStream(stream)
 .on("record", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 });
```

If you expect the first line your csv to headers you may pass a headers option in. Setting the headers option will
cause change each row to an object rather than an array.

```javascript
var stream = fs.createReadStream("my.csv");

csv()
 .fromStream(stream, {headers : true})
 .on("record", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 });

```

You may alternatively pass an array of header names which must match the order of each column in the csv, otherwise
the data columns will not match.

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream, {headers : ["firstName", "lastName", "address"]})
 .on("record", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 });

```

If your data may include empty rows, the sort Excel might include at the end of the file for instance, you can ignore
these by including the `ignoreEmpty` option.

Any rows consisting of nothing but empty strings and/or commas will be skipped, without emitting a 'data' or 'error' event.

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream, {ignoreEmpty: true})
 .on("record", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 });

```

### Validating

You can validate each row in the csv by providing a validate handler. If a row is invalid then a `data-invalid` event
will be emitted with the row and the index.

```javascript
var stream = fs.createReadStream("my.csv");

csv(
 .fromStream(stream, {headers : true})
 .validate(function(data){
     return data.age < 50; //all persons must be under the age of 50
 })
 .on("data-invalid", function(data){
     //do something with invalid row
 })
 .on("record", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 });

```

### Transforming

You can transform data by providing in a transform function. What is returned from the transform function will
be provided to validate and emitted as a row.

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream)
 .transform(function(data){
     return data.reverse(); //reverse each row.
 })
 .on("record", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 });

```

### Formatting

`fast-csv` also allows to you to create create a `CSV` from data.

Formatting accepts the same options as parsing with an additional `transform` option.

* `transform(row)`: A function that accepts a row and returns a transformed one to be written.

**`createWriteStream(options)`**

This is the lowest level of the write methods, it creates a stream that can be used to create a csv of unknown size and pipe to an output csv.

```javascript
var csvStream = csv.createWriteStream({headers: true}),
    writableStream = fs.createWriteStream("my.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});

csvSream.pipe(writableStream);
csvStream.write({a: "a0", b: "b0"});
csvStream.write({a: "a1", b: "b1"});
csvStream.write({a: "a2", b: "b2"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write(null);
```

If you wish to transform rows as writing then you can use the `.transform` method.

```javascript
var csvStream = csv
    .createWriteStream({headers: true})
    .transform(function(row){
        return {
           A: row.a,
           B: row.b
        };
    }),
    writableStream = fs.createWriteStream("my.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});

csvSream.pipe(writableStream);
csvStream.write({a: "a0", b: "b0"});
csvStream.write({a: "a1", b: "b1"});
csvStream.write({a: "a2", b: "b2"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write(null);
```

**Writing Data**

Each of the following methods accept an array of values to be written, however each value must be an `array` of `array`s or `object`s.

**`write(arr[, options])`**

Create a readable stream to read data from.

```javascript
var ws = fs.createWriteStream("my.csv");
csv
   .write([
       ["a", "b"],
       ["a1", "b1"],
       ["a2", "b2"]
   ], {headers: true})
   .pipe(ws);
```

```javascript
var ws = fs.createWriteStream("my.csv");
csv
   .write([
       {a: "a1", b: "b1"},
       {a: "a2", b: "b2"}
   ], {headers: true})
   .pipe(ws);
```

```javascript
var ws = fs.createWriteStream("my.csv");
csv
   .write([
       {a: "a1", b: "b1"},
       {a: "a2", b: "b2"}
   ], {
        headers: true
        transform: function(row){
            return {
                A: row.a,
                B: row.b
            };
        }
   })
   .pipe(ws);
```



**`writeToStream(stream,arr[, options])`**

Write an array of values to a `WritableStream`

```javascript
csv
   .writeToStream(fs.createWriteStream("my.csv"), [
       ["a", "b"],
       ["a1", "b1"],
       ["a2", "b2"]
   ], {headers: true});
```

```javascript
csv
   .writeToStream(fs.createWriteStream("my.csv"), [
       {a: "a1", b: "b1"},
       {a: "a2", b: "b2"}
   ], {headers: true})
   .pipe(ws);
```

```javascript
csv
   .writeToStream(fs.createWriteStream("my.csv"), [
       {a: "a1", b: "b1"},
       {a: "a2", b: "b2"}
   ], {
        headers: true,
        transform: function(row){
            return {
                A: row.a,
                B: row.b
            };
        }
   })
   .pipe(ws);
```

**`writeToPath(arr[, options])`**

Write an array of values to the specified path

```javascript
csv
   .writeToPath("my.csv", [
       ["a", "b"],
       ["a1", "b1"],
       ["a2", "b2"]
   ], {headers: true})
   .on("finish", function(){
       console.log("done!");
   });
```

```javascript
csv
   .writeToStream("my.csv", [
       {a: "a1", b: "b1"},
       {a: "a2", b: "b2"}
   ], {headers: true})
   .on("finish", function(){
      console.log("done!");
   });
```

```javascript
csv
   .writeToStream("my.csv", [
       {a: "a1", b: "b1"},
       {a: "a2", b: "b2"}
   ], {
        headers: true,
        transform: function(row){
            return {
                A: row.a,
                B: row.b
            };
        }
   })
   .on("finish", function(){
      console.log("done!");
   });
```

**`writeToString(arr[, options])`**

```javascript
csv.writeToString([
   ["a", "b"],
   ["a1", "b1"],
   ["a2", "b2"]
], {headers: true}); //"a,b\na1,b1\na2,b2\n"
```

```javascript
csv.writeToString([
   {a: "a1", b: "b1"},
   {a: "a2", b: "b2"}
], {headers: true}); //"a,b\na1,b1\na2,b2\n"
```

```javascript
csv.writeToString([
   {a: "a1", b: "b1"},
   {a: "a2", b: "b2"}
], {
        headers: true,
        transform: function(row){
            return {
                A: row.a,
                B: row.b
            };
        }
   }); //"a,b\na1,b1\na2,b2\n"
```

## Piping from Parser to Writer

You can use `fast-csv` to pipe the output from a parsed CSV to a transformed CSV by setting the parser to `objectMode` and using `createWriteStream`.

```javascript
csv
   .fromPath("in.csv", {headers: true})
   .pipe(csv.createWriteStream({headers: true}))
   .pipe(fs.createWriteStream("out.csv", {encoding: "utf8"}));
```

When piping from a parser to a formatter the transforms are maintained also.


```javascript
csv
   .fromPath("in.csv", {headers: true})
   .transform(function(obj){
        return {
            name: obj.Name,
            address: obj.Address,
            emailAddress: obj.Email_Address,
            verified: obj.Verified
        };
   })
   .pipe(csv.createWriteStream({headers: true}))
   .pipe(fs.createWriteStream("out.csv", {encoding: "utf8"}));
```

The output will contain formatted result from the transform function.

If you want to tranform on the formatting side


```javascript
var formatStream = csv
        .createWriteStream({headers: true})
        .transform(function(){
            return {
                name: obj.Name,
                address: obj.Address,
                emailAddress: obj.Email_Address,
                verified: obj.Verified
            };
        });  
csv
   .fromPath("in.csv", {headers: true})
   .pipe(formatStream)
   .pipe(fs.createWriteStream("out.csv", {encoding: "utf8"}));
```


## Benchmarks

`Parsing 20000 records AVG over 3 runs`

```
fast-csv: 198.67ms
csv:      525.33ms
```

`Parsing 50000 records AVG over 3 runs`

```
fast-csv: 441.33ms
csv:      1291ms
```

`Parsing 100000 records AVG over 3 runs`

```
fast-csv: 866ms
csv:      2773.33ms
```

`Parsing 1000000 records AVG over 3 runs`

```
fast-csv: 8562.67ms
csv:      30030.67ms
```

## License

MIT <https://github.com/C2FO/fast-csv/raw/master/LICENSE>

##Meta
* Code: `git clone git://github.com/C2FO/fast-csv.git`
* Website: <http://c2fo.com>
* Twitter: [http://twitter.com/c2fo](http://twitter.com/c2fo) - 877.465.4045
