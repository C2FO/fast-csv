import { EOL } from 'os';
import { parseString, RowMap, RowArray } from '../../src';

describe('Issue #540 - https://github.com/C2FO/fast-csv/issues/540', () => {
    const CSV_CONTENT = [
        ' , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , -',
    ].join(EOL);

    const expectedRows = [
        [
            ' , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ,' +
                ' , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ,' +
                ' , , , , , , , , , , , , , , -',
        ],
    ];

    it('allow transforming to any object shape', () => {
        return new Promise((res, rej) => {
            const invalid: RowArray[] = [];
            const rows: RowMap[] = [];
            parseString(CSV_CONTENT, { ignoreEmpty: true, delimiter: '\t' })
                .on('data-invalid', (row: RowArray) => {
                    return invalid.push(row);
                })
                .on('data', (r) => {
                    return rows.push(r);
                })
                .on('error', rej)
                .on('end', (count: number) => {
                    expect(rows).toEqual(expectedRows);
                    expect(invalid).toHaveLength(0);
                    expect(count).toBe(expectedRows.length + invalid.length);
                    res(() => {});
                });
        });
    });
});
