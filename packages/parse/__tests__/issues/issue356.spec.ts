import { EOL } from 'os';
import { parseString, RowMap, RowArray } from '../../src';

describe('Issue #356 - https://github.com/C2FO/fast-csv/issues/356', () => {
    interface InputRow {
        clicks: string;
    }

    interface ClicksRow {
        clicks?: number;
    }

    const CSV_CONTENT = ['clicks', `1`, '2', 'a'].join(EOL);
    const expectedRows = [{ clicks: 1 }, { clicks: 2 }, {}];

    it('allow transforming to any object shape', () => {
        return new Promise((res, rej) => {
            const invalid: RowArray[] = [];
            const rows: RowMap[] = [];
            parseString<InputRow, ClicksRow>(CSV_CONTENT, { headers: true, escape: "'" })
                .transform((row: InputRow) => {
                    const clicks = parseInt(row.clicks, 10);
                    if (Number.isInteger(clicks)) {
                        return { clicks };
                    }
                    return {};
                })
                .on('data-invalid', (row: RowArray) => invalid.push(row))
                .on('data', (r: ClicksRow) => rows.push(r))
                .on('error', rej)
                .on('end', (count: number) => {
                    expect(rows).toEqual(expectedRows);
                    expect(invalid).toHaveLength(0);
                    expect(count).toBe(expectedRows.length + invalid.length);
                    res();
                });
        });
    });
});
