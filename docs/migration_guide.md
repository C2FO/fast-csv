# Migration Guide

## From v2.x to v3.x

### Parsing Changed

#### Signature changes
  
* Calling the library as a function has been removed in favor of `csv.parse`.
  * `csv()` change to `csv.parse()`
* Deprecated `fromString` in favor of `parseString`
  * `csv.fromString()` change to `csv.parseString()`
* Deprecated `fromStream` in favor of `parseStream`a
    * `csv.fromStream()` change to `csv.parseStream()`
* Deprecated`fromPath` in favor of `parseFile`
    * `csv.fromPath()` change to `csv.parseFile()`

### Formatting Changes
  * `csv.createWriteStream` has been removed in favor of `csv.format`
  * `csv.writeToBuffer` and `csv.writeToString` no longer accepts a `callback`, instead they return a promise `Promise`