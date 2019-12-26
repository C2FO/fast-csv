import { promisify } from 'util';
import { Writable } from 'stream';
import * as fs from 'fs';
import { Row } from './types';
import { FormatterOptions, FormatterOptionsArgs } from './FormatterOptions';
import { CsvFormatterStream } from './CsvFormatterStream';

export * from './types';
export { CsvFormatterStream } from './CsvFormatterStream';
export { FormatterOptions, FormatterOptionsArgs } from './FormatterOptions';

export const format = <I extends Row, O extends Row>(options?: FormatterOptionsArgs<I, O>): CsvFormatterStream<I, O> =>
    new CsvFormatterStream(new FormatterOptions(options));

export const write = <I extends Row, O extends Row>(
    rows: I[],
    options?: FormatterOptionsArgs<I, O>,
): CsvFormatterStream<I, O> => {
    const csvStream = format(options);
    const promiseWrite = promisify((row: I, cb: (error?: Error | null) => void): void => {
        csvStream.write(row, undefined, cb);
    });
    rows.reduce(
        (prev: Promise<void>, row: I): Promise<void> => prev.then((): Promise<void> => promiseWrite(row)),
        Promise.resolve(),
    )
        .then((): void => csvStream.end())
        .catch((err): void => {
            csvStream.emit('error', err);
        });
    return csvStream;
};

export const writeToStream = <T extends NodeJS.WritableStream, I extends Row, O extends Row>(
    ws: T,
    rows: I[],
    options?: FormatterOptionsArgs<I, O>,
): T => write(rows, options).pipe(ws);

export const writeToBuffer = <I extends Row, O extends Row>(
    rows: I[],
    opts: FormatterOptionsArgs<I, O> = {},
): Promise<Buffer> => {
    const buffers: Buffer[] = [];
    const ws = new Writable({
        write(data, enc, writeCb): void {
            buffers.push(data);
            writeCb();
        },
    });
    return new Promise((res, rej): void => {
        ws.on('error', rej).on('finish', (): void => res(Buffer.concat(buffers)));
        write(rows, opts).pipe(ws);
    });
};

export const writeToString = <I extends Row, O extends Row>(
    rows: I[],
    options?: FormatterOptionsArgs<I, O>,
): Promise<string> => writeToBuffer(rows, options).then((buffer): string => buffer.toString());

export const writeToPath = <I extends Row, O extends Row>(
    path: string,
    rows: I[],
    options?: FormatterOptionsArgs<I, O>,
): fs.WriteStream => {
    const stream = fs.createWriteStream(path, { encoding: 'utf8' });
    return write(rows, options).pipe(stream);
};
