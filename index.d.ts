// Type definitions for fast-csv 2.4
// Project: http://c2fo.github.com/fast-csv/index.html
// Documentations comments derived from https://github.com/C2FO/fast-csv/blob/master/README.md

/*~ Note that ES6 modules cannot directly export callable functions.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('someLibrary');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

/// <reference types="node" />
import * as stream from 'stream';

export = fast_csv;

declare function fast_csv(options?: ParsingOptions): ParserStream;

declare namespace fast_csv {
    // Circular reference from fast_csv
    function parse(options?: ParsingOptions): ParserStream;

    /* Intentionally omitted, because it is not documented by the project and
     * the implementation currently creates a FormattingStream
     */
    // function createReadStream(options?: ParsingOptions): ParserStream;

    function createWriteStream(options?: FormattingOptions): CsvTransformStream;

    function format(options?: FormattingOptions): CsvTransformStream;

    function fromPath(location: string, options?: ParsingOptions): ParserStream;

    function fromStream(stream: NodeJS.ReadableStream, options?: ParsingOptions): ParserStream;

    function fromString(string: string, options?: ParsingOptions): ParserStream;

    function write(arr: any[], options: FormattingOptions | undefined, ws?: NodeJS.WritableStream): CsvTransformStream;

    function writeToBuffer(arr: Buffer, options: FormattingOptions | undefined, cb: ((error: any, result: Buffer) => void)): void;

    function writeToPath(path: string, arr: any[], options?: FormattingOptions): stream.Writable;

    function writeToStream<T extends NodeJS.WritableStream>(ws: T, arr: any[], options?: FormattingOptions): T;

    function writeToString(arr: any[], options: FormattingOptions | undefined, cb: ((error: any, result: string) => void)): void;
}

declare class ParserStream extends stream.Transform {
    validate(f: ((data: any, cb: (error: any, next?: any) => void) => void) | ((data: any) => boolean)): ParserStream;
    transform(f: ((data: any, cb: (error: any, next?: any) => void) => void) | ((data: any) => any)): ParserStream;
}

declare class CsvTransformStream extends stream.Transform {
    transform(f: ((data: any, cb: (error: any, next?: any) => void) => void) | ((data: any) => boolean)): CsvTransformStream;
}

interface HeaderQuoteOptions {
    [headerName: string]: boolean;
}

interface FormattingOptions extends GeneralOptions {
    /**
     * function that accepts a row and returns a transformed one to be written.
     */
    transform?: ((row: any) => any) | ((row: any, callback: (error: any, next?: any) => void) => void);

    /**
     * Specify an alternate row delimiter (i.e `\r\n`)
     */
    rowDelimiter?: string;

    /**
     * If `true` then all headers will be quoted.
     * If it is an object then each key that has a true value will be quoted
     * If it is an array then each item in the array that is true will have the header at the corresponding index quoted
     */
    quoteHeaders?: boolean | HeaderQuoteOptions | boolean[];

    /**
     * If `true` then columns and headers will be quoted (unless `quoteHeaders` is specified).
     * If it is an object then each key that has a true value will be quoted (unless `quoteHeaders` is specified)
     * If it is an array then each item in the array that is true will have the column at the corresponding index quoted (unless `quoteHeaders` is specified)
     */
    quoteColumns?: boolean | HeaderQuoteOptions | boolean[];
}

interface ParsingOptions extends GeneralOptions {
    /**
     * If you want to trim all values parsed set to `true`
     */
    trim?: boolean;

    /**
     * If you want to right trim all values parsed set to `true`.
     */
    rtrim?: boolean;

    /**
     * If you want to left trim all values parsed set to `true`.
     */
    ltrim?: boolean;

    /**
     * If your CSV contains comments you can use this option to ignore lines that begin with the specified character (e.g. `#`)
     */
    comment?: string;
}

interface GeneralOptions {
    /**
     * Ensure that data events have an object emitted rather than the stringified version set to false to have a stringified buffer
     */
    objectMode?: boolean;

    /**
     * Set to `true` if you expect the first line of your CSV to contain headers
     * Alternately, you can specify an array of headers to use.
     * You can also specify a sparse array to omit some of the columns.
     */
    headers?: boolean | string[] | Array<string | undefined>;

    /**
     * If you wish to ignore empty rows.
     */
    ignoreEmpty?: boolean;

    /**
     * If you want to discard columns that do not map to a header.
     */
    discardUnmappedColumns?: boolean;

    /**
     * If you want to consider empty lines/lines with too few fields as errors - Only to be used with `headers=true`
     */
    strictColumnHandling?: boolean;

    /**
     * If you want the first line of the file to be removed and replaced by the one provided in the `headers` option - Only to be used with `headers=[String]`
     */
    renameHeaders?: boolean;

    /**
     * If your data uses an alternate delimiter such as ; or \t.
     */
    delimiter?: string;

    /**
     * The character to use to escape values that contain a delimiter. If you set to `null` then all quoting will be ignored
     */
    quote?: string;

    /**
     * The character to use when escaping a value that is `quoted` and contains a `quote` character.
     *   i.e: 'First,"Name"';
     */
    escape?: string;
}
