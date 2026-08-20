import { EOL } from 'os';
import { parseString, RowArray, RowMap } from '../../src';

describe('Issue #772 - https://github.com/C2FO/fast-csv/issues/772', () => {
    const CSV_CONTENT = ['header1,header2', 'test1,test2,test3', 'test4'].join(EOL);

    it('preserves the strict column handling reason after transforming headers', () => {
        return new Promise<void>((resolve, reject) => {
            const invalidRows: RowArray[] = [];
            const invalidReasons: string[] = [];
            const rows: RowMap[] = [];

            parseString(CSV_CONTENT, {
                headers: (headers) => {
                    return headers.map((header) => {
                        return header?.toUpperCase();
                    });
                },
                strictColumnHandling: true,
            })
                .on('data-invalid', (row: RowArray, _rowNumber: number, reason: string) => {
                    invalidRows.push(row);
                    invalidReasons.push(reason);
                })
                .on('data', (row: RowMap) => {
                    rows.push(row);
                })
                .on('error', reject)
                .on('end', (count: number) => {
                    try {
                        expect(rows).toEqual([]);
                        expect(invalidRows).toEqual([['test1', 'test2', 'test3'], ['test4']]);
                        expect(invalidReasons).toEqual([
                            'Column header mismatch expected: 2 columns got: 3',
                            'Column header mismatch expected: 2 columns got: 1',
                        ]);
                        expect(count).toBe(2);
                        resolve();
                    } catch (err) {
                        reject(err instanceof Error ? err : new Error(String(err)));
                    }
                });
        });
    });
});
