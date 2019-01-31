[![build status](https://secure.travis-ci.org/C2FO/fast-csv.svg)](http://travis-ci.org/C2FO/fast-csv)
# Fast-csv

This is a library that provides CSV parsing and formatting.

**NOTE** As of v0.2.0 `fast-csv` supports multi-line values.

## Installation

`npm install fast-csv`

## Usage

### Parsing

All methods accept the following `options`

* `objectMode=true`: Ensure that `data` events have an object emitted rather than the stringified version set to false to have a stringified buffer.
* `headers=false`: Set to true if you expect the first line of your `CSV` to contain headers, alternatly you can specify an array of headers to use. You can also specify a sparse array to omit some of the columns.
* `ignoreEmpty=false`: If you wish to ignore empty rows.
* `discardUnmappedColumns=false`: If you want to discard columns that do not map to a header.
* `strictColumnHandling=false`: If you want to consider empty lines/lines with too few fields as errors - Only to be used with `headers=true`
* `renameHeaders=false`: If you want the first line of the file to be removed and replaced by the one provided in the `headers` option - Only to be used with `headers=[String]`
* `delimiter=','`: If your data uses an alternate delimiter such as `;` or `\t`.
   * **NOTE** When specifying an alternate `delimiter` you may only pass in a single character delimiter
* `quote='"'`: The character to use to escape values that contain a delimiter. If you set to `null` then all quoting will be ignored
* `escape='"'`: The character to use when escaping a value that is `quoted` and contains a `quote` character.
    * `i.e`: 'First,"Name"' => '"First,""name"""'
* The following are options for parsing only.
  * `trim=false`: If you want to trim all values parsed set to true.
  * `rtrim=false`: If you want to right trim all values parsed set to true.
  * `ltrim=false`: If you want to left trim all values parsed set to true.
  * `comment=null`: If your CSV contains comments you can use this option to ignore lines that begin with the specified character (e.g. `#`).


**events**

* `data`: Emitted when a record is parsed.
* `data-invalid`: Emitted if there was invalid row encounted, **only emitted if the `validate` function is used or `strictColumnHandling=true`**.
* `data`: Emitted with the object or `stringified` version if the `objectMode` is set to `false`.

**`([options])` or `.parse(options)`**

If you use `fast-csv` as a function it returns a transform stream that can be piped into.

```javascript
var stream = fs.createReadStream("my.csv");

var csvStream = csv()
    .on("data", function(data){
         console.log(data);
    })
    .on("end", function(){
         console.log("done");
    });

stream.pipe(csvStream);

//or

var csvStream = csv
    .parse()
    .on("data", function(data){
         console.log(data);
    })
    .on("end", function(){
         console.log("done");
    });

stream.pipe(csvStream);
```

```javascript
fs.createReadStream("my.csv")
    .pipe(csv())
    .on("data", function(data){
        console.log(data);
    })
    .on("end", function(){
        console.log("done");
    });
```

```javascript
var fileStream = fs.createReadStream("my.csv"),
    parser = fastCsv();

fileStream
    .on("readable", function () {
        var data;
        while ((data = fileStream.read()) !== null) {
            parser.write(data);
        }
    })
    .on("end", function () {
        parser.end();
    });

parser
    .on("readable", function () {
        var data;
        while ((data = parser.read()) !== null) {
            console.log(data);
        }
    })
    .on("end", function () {
        console.log("done");
    });
```


**`.fromPath(path[, options])`**

This method parses a file from the specified path.

```javascript
var csv = require("fast-csv");

csv
 .fromPath("my.csv")
 .on("data", function(data){
     console.log(data);
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
 .fromString(CSV_STRING, {headers: true})
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });
```

**`.fromStream(stream[, options])`**

This accepts a readable stream to parse data from.

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream)
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });
```

If you expect the first line your CSV to be headers you may pass in a `headers` option. Setting the `headers` option will
cause change each row to an object rather than an array.

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream, {headers : true})
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });

```

You may alternatively pass an array of header names which must match the order of each column in the CSV, otherwise
the data columns will not match.

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream, {headers : ["firstName", "lastName", "address"]})
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });

```

To omit some of the data columns you may not need, pass a sparse array as `headers`.

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream, {headers : ["firstName" , , "address"]})
 .on("data", function(data){
     console.log(data);
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
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });

```

### Validating

You can validate each row in the CSV by providing a validate handler. If a row is invalid then a `data-invalid` event
will be emitted with the row and the index.

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream, {headers : true})
 .validate(function(data){
     return data.age < 50; //all persons must be under the age of 50
 })
 .on("data-invalid", function(data){
     //do something with invalid row
 })
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });

```

If your validation is `async` then your validation function

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream)
 .validate(function(data, next){
     MyModel.findById(data.id, function(err, model){
        if(err){
            next(err);
        }else{
            next(null, !model); //valid if the model does not exist
        }
     });
 })
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });
```

### Transforming

You can transform data by providing a transform function. What is returned from the transform function will
be provided to validate and emitted as a row.

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream)
 .transform(function(data){
     return data.reverse(); //reverse each row.
 })
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });

```

If your transform function expects two arguments then a callback function will be provided and should be called once the validation is complete. This is useful when doing async validation

```javascript
var stream = fs.createReadStream("my.csv");

csv
 .fromStream(stream)
 .transform(function(data, next){
     MyModel.findById(data.id, next);
 })
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });

```

### Formatting

`fast-csv` also allows you to create a `CSV` from data.

Formatting accepts the same options as parsing with an additional `transform` option.

* `transform(row[, cb])`: A function that accepts a row and returns a transformed one to be written, or your function can accept an optional callback to do async transformations.
* `rowDelimiter='\n'`: Specify an alternate row delimiter (i.e `\r\n`)
* `includeEndRowDelimiter=false`: Set to `true` to include a row delimiter at the end of the csv.
* `quoteHeaders=false`
   * If `true` then all headers will be quoted.
   * If it is an object then each key that has a true value will be quoted (see example below)
   * If it is an array then each item in the array that is true will have the header at the corresponding index quoted (see example below)
* `quoteColumns=false`
   * If `true` then columns and headers will be quoted (unless `quoteHeaders` is specified).
   * If it is an object then each key that has a true value will be quoted ((unless `quoteHeaders` is specified)
   * If it is an array then each item in the array that is true will have the column at the corresponding index quoted (unless `quoteHeaders` is specified)

### Data Types

When creating a CSV `fast-csv` supports a few data formats.

**`Objects`**

You can pass in object to any formatter function if your CSV requires headers the keys of the first object will be used as the header names.

```javascript
[
    {
        a: "a1",
        b: "b1",
        c: "c1"
    }
]

//Generated CSV
//a,b,c
//a1,b1,c1
```

**`Arrays`**

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

**`Arrays of Array`**

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

### Formatting Functions

**`createWriteStream(options)` or `.format(options)`**

This is the lowest level of the write methods, it creates a stream that can be used to create a CSV of unknown size and pipe to an output CSV.

```javascript
var csvStream = csv.createWriteStream({headers: true}),
    writableStream = fs.createWriteStream("my.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});

csvStream.pipe(writableStream);
csvStream.write({a: "a0", b: "b0"});
csvStream.write({a: "a1", b: "b1"});
csvStream.write({a: "a2", b: "b2"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write({a: "a3", b: "b4"});
csvStream.end();

//or

var csvStream = csv.format({headers: true}),
    writableStream = fs.createWriteStream("my.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});

csvStream.pipe(writableStream);
csvStream.write({a: "a0", b: "b0"});
csvStream.write({a: "a1", b: "b1"});
csvStream.write({a: "a2", b: "b2"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write({a: "a3", b: "b4"});
csvStream.end();
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

csvStream.pipe(writableStream);
csvStream.write({a: "a0", b: "b0"});
csvStream.write({a: "a1", b: "b1"});
csvStream.write({a: "a2", b: "b2"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write({a: "a3", b: "b4"});
csvStream.end();

//or
var csvStream = csv
    .format({headers: true})
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

csvStream.pipe(writableStream);
csvStream.write({a: "a0", b: "b0"});
csvStream.write({a: "a1", b: "b1"});
csvStream.write({a: "a2", b: "b2"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write({a: "a3", b: "b4"});
csvStream.end();
```

Transform can also be async by accepting a callback.


```javascript
var csvStream = csv
    .createWriteStream({headers: true})
    .transform(function(row, next){
        setImmediate(function(){
            next(null, {A: row.a, B: row.b});
        });;
    }),
    writableStream = fs.createWriteStream("my.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});

csvStream.pipe(writableStream);
csvStream.write({a: "a0", b: "b0"});
csvStream.write({a: "a1", b: "b1"});
csvStream.write({a: "a2", b: "b2"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write({a: "a3", b: "b4"});
csvStream.end();

//or

var csvStream = csv
    .format({headers: true})
    .transform(function(row, next){
        setImmediate(function(){
            next(null, {A: row.a, B: row.b});
        });;
    }),
    writableStream = fs.createWriteStream("my.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});

csvStream.pipe(writableStream);
csvStream.write({a: "a0", b: "b0"});
csvStream.write({a: "a1", b: "b1"});
csvStream.write({a: "a2", b: "b2"});
csvStream.write({a: "a3", b: "b4"});
csvStream.write({a: "a3", b: "b4"});
csvStream.end();
```

**Writing Data**

Each of the following methods accept an array of values to be written, however each value must be an `array` of `array`s or `object`s.

**`write(arr[, options])`**

Create a writable stream to write data to.

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



**`writeToStream(stream, arr[, options])`**

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

**`writeToPath(path, arr[, options])`**

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
   .writeToPath("my.csv", [
       {a: "a1", b: "b1"},
       {a: "a2", b: "b2"}
   ], {headers: true})
   .on("finish", function(){
      console.log("done!");
   });
```

```javascript
csv
   .writeToPath("my.csv", [
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

**`writeToString(arr[, options], cb)`**

```javascript
csv.writeToString(
    [
        ["a", "b"],
        ["a1", "b1"],
        ["a2", "b2"]
    ],
    {headers: true},
    function(err, data){
        console.log(data); //"a,b\na1,b1\na2,b2\n"
    }
);
```

```javascript
csv.writeToString(
    [
        {a: "a1", b: "b1"},
        {a: "a2", b: "b2"}
    ],
    {headers: true},
    function(err, data){
        console.log(data); //"a,b\na1,b1\na2,b2\n"
    }
);
```

```javascript
csv.writeToString(
    [
        {a: "a1", b: "b1"},
        {a: "a2", b: "b2"}
    ],
    {
        headers: true,
        transform: function (row) {
            return {
                A: row.a,
                B: row.b
            };
        }
    },
    function (err, data) {
        console.log(data); //"A,B\na1,b1\na2,b2\n"
    }
);
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

If you want to transform on the formatting side


```javascript
var formatStream = csv
        .createWriteStream({headers: true})
        .transform(function(obj){
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

## Quoting Columns

Sometimes you may need to quote columns is certain ways in order meet certain requirements. `fast-csv` can quote columns and headers almost anyway you may need.

**Note** in the following example we use `writeToString` but the options option are valid for any of the formatting methods.

### `quoteColumns`

```javascript
//quote all columns including headers
var objectData = [{a: "a1", b: "b1"}, {a: "a2", b: "b2"}],
    arrayData = [["a", "b"], ["a1", "b1"], ["a2", "b2"]];
csv.writeToString(objectData, {headers: true, quoteColumns: true}, function(err, data){
    console.log(data); //"a","b"
                       //"a1","b1"
                       //"a2","b2"
});

//only quote the "a" column
csv.writeToString(objectData, {headers: true, quoteColumns: {a: true}}, function(err, data){
    console.log(data); //"a",b
                       //"a1",b1
                       //"a2",b2
});

//only quote the second column
csv.writeToString(arrayData, {headers: true, quoteColumns: [false, true]}, function(err, data){
    console.log(data); //a,"b"
                       //a1,"b1"
                       //a2,"b2"
});

```

### `quoteHeaders`

```javascript
//quote all columns including headers
var objectData = [{a: "a1", b: "b1"}, {a: "a2", b: "b2"}],
    arrayData = [["a", "b"], ["a1", "b1"], ["a2", "b2"]];
csv.writeToString(objectData, {headers: true, quoteHeaders: true}, function(err, data){
    console.log(data); //"a","b"
                       //a1,b1
                       //a2,b2
});

//only quote the "a" column
csv.writeToString(objectData, {headers: true, quoteHeaders: {a: true}}, function(err, data){
    console.log(data); //"a",b
                       //a1,b1
                       //a2,b2
});

//only quote the second column
csv.writeToString(arrayData, {headers: true, quoteHeaders: [false, true]}, function(err, data){
    console.log(data); //a,"b"
                       //a1,b1
                       //a2,b2
});

//quoting columns and not headers

//only quote the second column
csv.writeToString(arrayData, {headers: true, quoteHeaders: false, quoteColumns: true}, function(err, data){
    console.log(data); //a,b
                       //"a1","b1"
                       //"a2","b2"
});
```

## License

MIT <https://github.com/C2FO/fast-csv/raw/master/LICENSE>

## Meta
* Code: `git clone git://github.com/C2FO/fast-csv.git`
* Website: <http://c2fo.com>
* Twitter: [http://twitter.com/c2fo](http://twitter.com/c2fo) - 877.465.4045
