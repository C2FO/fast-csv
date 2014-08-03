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

