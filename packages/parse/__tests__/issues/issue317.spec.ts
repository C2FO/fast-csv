import { EOL } from 'os';
import { parseString, RowMap, RowArray } from '../../src';

describe('Issue #317 - https://github.com/C2FO/fast-csv/issues/317', () => {
    const CSV_CONTENT = ['header1,header2', 'col1', 'col2,col2', 'col3', 'col4,col4', 'col5,col5', 'col6,col6'].join(
        EOL,
    );
    const expectedInvalidRows = [['col3']];
    const expectedRows = [
        { header1: 'col4', header2: 'col4' },
        { header1: 'col5', header2: 'col5' },
        { header1: 'col6', header2: 'col6' },
    ];

    it('skip trailing whitespace after a quoted field', (done) => {
        const invalid: RowArray[] = [];
        const rows: RowMap[] = [];
        parseString(CSV_CONTENT, { headers: true, skipRows: 2, strictColumnHandling: true, maxRows: 4 })
            .on('data-invalid', (row: RowArray) => invalid.push(row))
            .on('data', (r: RowMap) => rows.push(r))
            .on('error', done)
            .on('end', (count: number) => {
                expect(rows).toEqual(expectedRows);
                expect(invalid).toEqual(expectedInvalidRows);
                expect(count).toBe(expectedRows.length + invalid.length);
                done();
            });
    });
});
