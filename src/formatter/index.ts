import { promisify } from 'util';
import { Writable } from 'stream';
import * as fs from 'fs';
import { Row as FormatterRow } from './types';
import { FormatterOptions, FormatterOptionsArgs } from './FormatterOptions';
import CsvFormatterStream from './CsvFormatterStream';

export { default as CsvFormatterStream } from './CsvFormatterStream';
export * from './types';
export * from './FormatterOptions';

export const format = (options?: FormatterOptionsArgs): CsvFormatterStream => new CsvFormatterStream(new FormatterOptions(options));

export const write = (rows: FormatterRow[], options?: FormatterOptionsArgs): CsvFormatterStream => {
    const csvStream = format(options);
    const promiseWrite = promisify((row: FormatterRow, cb: (error?: Error | null) => void): void => {
        csvStream.write(row, undefined, cb);
    });
    rows.reduce(
        (prev: Promise<void>, row: FormatterRow): Promise<void> => prev.then((): Promise<void> => promiseWrite(row)),
        Promise.resolve()
    )
        .then((): void => csvStream.end())
        .catch((err): void => {
            csvStream.emit('error', err);
        });
    return csvStream;
};

export const writeToStream = <T extends NodeJS.WritableStream>(ws: T, rows: FormatterRow[], options?: FormatterOptionsArgs): T => write(rows, options)
    .pipe(ws);

export const writeToBuffer = (rows: FormatterRow[], opts: FormatterOptionsArgs = {}): Promise<Buffer> => {
    const buffers: Buffer[] = [];
    const ws = new Writable({
        write(data, enc, writeCb): void {
            buffers.push(data);
            writeCb();
        },
    });
    return new Promise((res, rej): void => {
        ws
            .on('error', rej)
            .on('finish', (): void => res(Buffer.concat(buffers)));
        write(rows, opts).pipe(ws);
    });
};


export const writeToString = (rows: FormatterRow[], options?: FormatterOptionsArgs): Promise<string> => writeToBuffer(rows, options)
    .then((buffer): string => buffer.toString());

export const writeToPath = (path: string, rows: FormatterRow[], options?: FormatterOptionsArgs): fs.WriteStream => {
    const stream = fs.createWriteStream(path, { encoding: 'utf8' });
    return write(rows, options).pipe(stream);
};
