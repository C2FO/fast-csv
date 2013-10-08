<a name="top"></a>


  [![build status](https://secure.travis-ci.org/C2FO/fast-csv.png)](http://travis-ci.org/C2FO/fast-csv)
# Fast-csv

This is a library is aimed at providing fast CSV parsing. It accomplishes this by not handling some of the more complex
edge cases such as multi line rows. However it does support escaped values, embedded commas, double and single quotes.

## Installation

`npm install fast-csv`

## Usage

To parse a file.

```javascript
var csv = require("fast-csv");

csv("my.csv")
 .on("data", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 })
 .parse();
```

You may also parse a stream.

```javascript
var stream = fs.createReadStream("my.csv");

csv(stream)
 .on("data", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 })
 .parse();

```

If you expect the first line your csv to headers you may pass a headers option in. Setting the headers option will
cause change each row to an object rather than an array.

```javascript
var stream = fs.createReadStream("my.csv");

csv(stream, {headers : true})
 .on("data", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 })
 .parse();

```

You may alternatively pass an array of header names which must match the order of each column in the csv, otherwise
the data columns will not match.

```javascript
var stream = fs.createReadStream("my.csv");

csv(stream, {headers : ["firstName", "lastName", "address"]})
 .on("data", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 })
 .parse();

```

If your data may include empty rows, the sort Excel might include at the end of the file for instance, you can ignore
these by including the `ignoreEmpty` option.

Any rows consisting of nothing but empty strings and/or commas will be skipped, without emitting a 'data' or 'error' event.

```javascript
var stream = fs.createReadStream("my.csv");

csv(stream, {ignoreEmpty: true})
 .on("data", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 })
 .parse();

```

### Validating

You can validate each row in the csv by providing a validate handler. If a row is invalid then a `data-invalid` event
will be emitted with the row and the index.

```javascript
var stream = fs.createReadStream("my.csv");

csv(stream, {headers : true})
 .validate(function(data){
     return data.age < 50; //all persons must be under the age of 50
 })
 .on("data-invalid", function(data){
     //do something with invalid row
 })
 .on("data", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 })
 .parse();

```

### Transforming

You can transform data by providing in a transform function. What is returned from the transform function will
be provided to validate and emitted as a row.

```javascript
var stream = fs.createReadStream("my.csv");

csv(stream)
 .transform(function(data){
     return data.reverse(); //reverse each row.
 })
 .on("data", function(data){
     console.log(data):
 })
 .on("end", function(){
     console.log("done");
 })
 .parse();

```

## License

MIT <https://github.com/C2FO/fast-csv/raw/master/LICENSE>

##Meta
* Code: `git clone git://github.com/C2FO/fast-csv.git`
* Website: <http://c2fo.com>
* Twitter: [http://twitter.com/c2fo](http://twitter.com/c2fo) - 877.465.4045



