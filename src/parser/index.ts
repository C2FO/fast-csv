import * as fs from 'fs';
import { Readable } from 'stream';
import { ParserOptions, ParserOptionsArgs } from './ParserOptions';
import CsvParserStream from './CsvParserStream';

export { default as CsvParserStream } from './CsvParserStream';
export * from './types';
export * from './ParserOptions';

export const parse = (args?: ParserOptionsArgs): CsvParserStream => new CsvParserStream(new ParserOptions(args));

export const parseStream = (stream: NodeJS.ReadableStream, options?: ParserOptionsArgs): CsvParserStream => stream
    .pipe(new CsvParserStream(new ParserOptions(options)));

export const parseFile = (location: string, options = {}): CsvParserStream => fs
    .createReadStream(location)
    .pipe(new CsvParserStream(new ParserOptions(options)));

export const parseString = (string: string, options?: ParserOptionsArgs): CsvParserStream => {
    const rs = new Readable();
    rs.push(string);
    rs.push(null);
    return rs.pipe(new CsvParserStream(new ParserOptions(options)));
};
