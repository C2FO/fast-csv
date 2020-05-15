/* eslint-disable @typescript-eslint/no-explicit-any */
import { CsvParserStream, Row } from '../../src';

export interface PathAndContent<T extends Row> {
    path: string;
    content: string | Buffer;
    parsed: T[];
}
export interface ParseResults<O extends Row> {
    count: number;
    rows: O[];
    invalidRows: Row[];
}

export const collectData = <I extends Row, O extends Row>(stream: CsvParserStream<I, O>): Promise<ParseResults<O>> =>
    new Promise((res, rej) => {
        const rows: O[] = [];
        const invalidRows: Row[] = [];
        stream
            .on('data', (row: O) => rows.push(row))
            .on('data-invalid', (row: Row) => invalidRows.push(row))
            .on('error', rej)
            .on('end', (count: number) => {
                res({ count, rows, invalidRows });
            });
    });

export const parseContentAndCollectFromStream = <I extends Row, O extends Row>(
    data: PathAndContent<O>,
    parser: CsvParserStream<I, O>,
): Promise<ParseResults<O>> => {
    return new Promise((res, rej) => {
        const rows: O[] = [];
        const invalidRows: Row[] = [];
        parser
            .on('data', (row: O) => rows.push(row))
            .on('data-invalid', (row) => invalidRows.push(row))
            .on('error', rej)
            .on('end', (count: number) => {
                res({ count, rows, invalidRows });
            });
        parser.write(data.content);
        parser.end();
    });
};

export const expectParsed = <R extends Row>(
    resultsPromise: Promise<ParseResults<R>>,
    expectedRows: any[],
    expectedInvalidRows: any[] = [],
): Promise<void> => {
    return expect(resultsPromise).resolves.toEqual({
        count: expectedRows.length + expectedInvalidRows.length,
        rows: expectedRows,
        invalidRows: expectedInvalidRows,
    });
};
