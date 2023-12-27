import { resolve } from 'path';
import { parseFile } from '../../src';

describe('Issue #102 - https://github.com/C2FO/fast-csv/issues/102', () => {
    const row = [
        '123456',
        '123456',
        '2018-02-01T16:05:16Z',
        '7',
        '80428',
        '65756',
        'Unquoted_String_With_Underscores_Hypens And_Spaces And-Numbers 1',
        '{"JSON":"DATA"}',
    ];

    it('parse all rows', () => {
        return new Promise((res, rej) => {
            let receivedRows = 0;
            parseFile(resolve(__dirname, '__fixtures__', 'issue102.csv'))
                .on('data-invalid', () => {
                    return rej(new Error('Should not have received data-invalid event'));
                })
                .on('data', (r) => {
                    receivedRows += 1;
                    if (receivedRows % 1000 !== 0) {
                        return;
                    }
                    expect(r).toEqual(row);
                })
                .on('error', (err) => {
                    return rej(err);
                })
                .on('end', (rowCount: number) => {
                    expect(rowCount).toBe(100000);
                    expect(receivedRows).toBe(rowCount);
                    res(() => {});
                });
        });
    });
});
