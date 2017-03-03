# v2.4.0

* Allow renaming headers. [#175](https://github.com/C2FO/fast-csv/pull/175)

# v2.3.1

* Now removes the byte order mark from a UTF-8 file if this is present. [#170](https://github.com/C2FO/fast-csv/pull/170)

# v2.3.0

* Writing object ends up with function definitions [#158](https://github.com/C2FO/fast-csv/pull/158)

# v2.2.0

* Handle split CRLF [#156](https://github.com/C2FO/fast-csv/pull/156) - [@alexeits](https://github.com/alexeits)

# v2.1.0

* Now handles tab delimited CSVs with only spaces for field values
* Handles CSVs with only spaces for field values

# v2.0.1

* Fix for last column empty when line end with a delimiter.

# v2.0.0

* Fast CSV will now handles the last column being empty.

# v1.1.0

* Fix for when chunk returned by transform to the parser ends with a space
* Functionality to give a reason when invalid data
* Fix problem with utf8 encoded streams that have multi-byte characters
* Allow passing sparse array of headers

# v1.0.0

* Node 4 and 5 support.
* Deprecating the `record` event.

# v0.6.0

* Removed try catch from emit to allow bubbling up of errors to process, if one is thrown [#93](https://github.com/C2FO/fast-csv/issues/93)
    * This also fixed issue [#92](https://github.com/C2FO/fast-csv/issues/92) where a loop was entered when `this.emit("error")` was called.
* Added new tests

# v0.5.7

* Strict record handling [#53](https://github.com/C2FO/fast-csv/pull/53) - [@derjust](https://github.com/derjust)

# v0.5.6

* Fixed issue where parser_stream was emitting end early [#87](https://github.com/C2FO/fast-csv/issues/87)
  * Changed to not emit end during flush
  * Changed catch errors on emit and emit as "error" event
* Added support for node `v0.12`

# v0.5.5
* Fixed issues with ordering of headers when specifying headers in a write stream [#77](https://github.com/C2FO/fast-csv/pull/77)
* Fixed issue where headers were not being written if no data was supplied to write stream.

# v0.5.4

* Fixed issues with error handling and not registering an error handler on stream [#68](https://github.com/C2FO/fast-csv/issues/68)
* Added support for ignoring quoting while parsing [#75](https://github.com/C2FO/fast-csv/issues/75)

# v0.5.3

* Fixed issues with `v0.11` stream implementation [#73](https://github.com/C2FO/fast-csv/issues/73)
* Fixed issues with `pause/resume` and data events in `v0.10` [#69](https://github.com/C2FO/fast-csv/issues/69)
* Fixed the double invoking of done callback when parsing files [#68](https://github.com/C2FO/fast-csv/issues/68)
* Refactored tests

# v0.5.2

* Fixed issue with `writeToString` and `writeToPath` examples [#64](https://github.com/C2FO/fast-csv/issues/64)
* Fixed issue with creating a csv without headers [#63](https://github.com/C2FO/fast-csv/issues/63)

# v0.5.1

* Fixed issue where line data was not being passed between transforms in the parser_stream

# v0.5.0

* Added support for async transforms [#24](https://github.com/C2FO/fast-csv/issues/24)
* Added support for async validation
* Added support for new data format
```
[
    [["header", "value1"], ["header2", "value2"]],
    [["header", "value2"], ["header2", "value2"]]
]
```
* Added support for forcing the quoting columns and headers
   * `quoteColumns` - Can be a boolean, object or array to specify how quoting should be done (see README)
   * `quoteHeaders` - Can be a boolean, object or array to specify how quoting should be done (see README)
* More tests
* Code refactor and clean up

# v0.4.4

* Added support for comments. [#56](https://github.com/C2FO/fast-csv/issues/56)

# v0.4.3

* Added ability to include a `rowDelimiter` at the end of a csv with the `includeEndRowDelimiter` option [#54](https://github.com/C2FO/fast-csv/issues/54)
* Added escaping for values that include a row delimiter
* Added more tests for new feature and escaping row delimiter values.

# v0.4.2

* Added ability to specify a rowDelimiter when creating a csv.
* Added discardUnmappedColumns option to allow the ignoring of extra data [#45](https://github.com/C2FO/fast-csv/pull/45)

# v0.4.1

* Fixed race condition that occurred if you called pause during a flush.

# v0.4.0

* Fixed misspelling of `delimiter` [#40](https://github.com/C2FO/fast-csv/issues/40)

# v0.3.1

* Added transform support to formatters
   * When using `createWriteStream` you can now you the `transform` method to specify a row transformer.
   * When using other transform methods you can specify a `transform` option.

# v0.3.0

* You can now specify `objectMode` when parsing a csv which will cause `data` events to have an object emitted.
* You can now pipe directly to the stream returned from `createWriteStream`
* You can now transform csvs by piping output from parsing into a formatter.

# v0.2.5

* Fixed issue where not all rows are emitted when using `pause` and `resume`

# v0.2.4

* Added more fine grained control to `.pause` and `.resume`
   * You can now pause resume between chunks

# v0.2.3

* Add new `createWriteStream` for creating a streaming csv writer

# v0.2.2

* Fixed issue with having line breaks containing `\r\n`

# v0.2.1

* Fixed issue with `\r` line break in parser

# v0.2.0

* Added multiline value support
* Updated escaping logic
* More performance enhancements
* More robusts test cases
* Removed support for having two quote types instead it just supports a single quote and escape sequence.
 Source code (zip)

# v0.1.2

* Fixed issue with formatter handling undefined or null values.
* Changed formatter not not include a new line at the end of a CSV.
* Added pause and resume functionality to ParserStream

# v0.1.1

* Added trim, ltrim, and rtrim to parsing options

# v0.1.0
