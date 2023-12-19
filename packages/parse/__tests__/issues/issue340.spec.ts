import { EOL } from 'os';
import { parseString, RowMap, RowArray } from '../../src';

describe('Issue #340 - https://github.com/C2FO/fast-csv/issues/340', () => {
    const CSV_CONTENT = ['Col1', `"A '"Good'" row''"`, 'Row 2'].join(EOL);
    const expectedRows = [{ Col1: `A "Good" row'` }, { Col1: 'Row 2' }];

    it('handle a trailing escape', () =>
        new Promise((res, rej) => {
            const invalid: RowArray[] = [];
            const rows: RowMap[] = [];
            parseString(CSV_CONTENT, { headers: true, escape: "'" })
                .on('data-invalid', (row: RowArray) => invalid.push(row))
                .on('data', (r: RowMap) => rows.push(r))
                .on('error', rej)
                .on('end', (count: number) => {
                    expect(rows).toEqual(expectedRows);
                    expect(invalid).toHaveLength(0);
                    expect(count).toBe(expectedRows.length + invalid.length);
                    res();
                });
        }));
});
