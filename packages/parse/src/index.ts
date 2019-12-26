import * as fs from 'fs';
import { Readable } from 'stream';
import { ParserOptions, ParserOptionsArgs } from './ParserOptions';
import { CsvParserStream } from './CsvParserStream';
import { Row } from './types';

export * from './types';
export { CsvParserStream } from './CsvParserStream';
export { ParserOptions, ParserOptionsArgs } from './ParserOptions';

export const parse = <I extends Row, O extends Row>(args?: ParserOptionsArgs): CsvParserStream<I, O> =>
    new CsvParserStream(new ParserOptions(args));

export const parseStream = <I extends Row, O extends Row>(
    stream: NodeJS.ReadableStream,
    options?: ParserOptionsArgs,
): CsvParserStream<I, O> => stream.pipe(new CsvParserStream(new ParserOptions(options)));

export const parseFile = <I extends Row, O extends Row>(
    location: string,
    options: ParserOptionsArgs = {},
): CsvParserStream<I, O> => fs.createReadStream(location).pipe(new CsvParserStream(new ParserOptions(options)));

export const parseString = <I extends Row, O extends Row>(
    string: string,
    options?: ParserOptionsArgs,
): CsvParserStream<I, O> => {
    const rs = new Readable();
    rs.push(string);
    rs.push(null);
    return rs.pipe(new CsvParserStream(new ParserOptions(options)));
};
