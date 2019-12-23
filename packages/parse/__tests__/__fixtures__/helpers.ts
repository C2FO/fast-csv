/* eslint-disable @typescript-eslint/no-explicit-any */
import { CsvParserStream, Row } from '../../src';

export interface PathAndContent {
    path: string;
    content: string | Buffer;
}
export interface ParseResults {
    count: number;
    rows: Row[];
    invalidRows: Row[];
}

export const collectData = (stream: CsvParserStream): Promise<ParseResults> =>
    new Promise((res, rej) => {
        const rows: Row[] = [];
        const invalidRows: Row[] = [];
        stream
            .on('data', (row: Row) => rows.push(row))
            .on('data-invalid', (row: Row) => invalidRows.push(row))
            .on('error', rej)
            .on('end', (count: number) => {
                res({ count, rows, invalidRows });
            });
    });

export const parseContentAndCollectFromStream = (
    data: PathAndContent,
    parser: CsvParserStream,
): Promise<ParseResults> =>
    new Promise((res, rej) => {
        const rows: Row[] = [];
        const invalidRows: Row[] = [];
        parser
            .on('data', row => rows.push(row))
            .on('data-invalid', row => invalidRows.push(row))
            .on('error', rej)
            .on('end', (count: number) => {
                res({ count, rows, invalidRows });
            });
        parser.write(data.content);
        parser.end();
    });

export const expectParsed = (
    resultsPromise: Promise<ParseResults>,
    expectedRows: any[],
    expectedInvalidRows: any[] = [],
): Promise<void> => {
    return expect(resultsPromise).resolves.toEqual({
        count: expectedRows.length + expectedInvalidRows.length,
        rows: expectedRows,
        invalidRows: expectedInvalidRows,
    });
};
