import { EOL } from 'os';
import * as assert from 'assert';
import * as csv from '../../src';
import { RowMap } from '../../src/parser';

describe('Issue #214 - https://github.com/C2FO/fast-csv/issues/214', () => {
    const CSV_CONTENT = [
        'firstName,lastName,emailAddress',
        'First1,Last1,email1@email.com',
        'First2,Last2,email2@email.com',
        'First3,Last3,email3@email.com',
        'First4,Last4,email4@email.com',
    ].join(EOL);

    const expectedRows = [
        { firstName: 'First1', lastName: 'Last1', emailAddress: 'email1@email.com' },
        { firstName: 'First2', lastName: 'Last2', emailAddress: 'email2@email.com' },
        { firstName: 'First3', lastName: 'Last3', emailAddress: 'email3@email.com' },
        { firstName: 'First4', lastName: 'Last4', emailAddress: 'email4@email.com' },
    ];

    it('should emit data when using the on method', next => {
        const rows: RowMap[] = [];
        csv.parseString(CSV_CONTENT, { headers: true })
            .on('data', (r: RowMap) => rows.push(r))
            .on('error', next)
            .on('end', (count: number) => {
                assert.deepStrictEqual(rows, expectedRows);
                assert.strictEqual(count, expectedRows.length);
                next();
            });
    });

    it('should emit data when using the addListener method', next => {
        const rows: RowMap[] = [];
        csv.parseString(CSV_CONTENT, { headers: true })
            .addListener('data', (r: RowMap) => rows.push(r))
            .on('error', next)
            .on('end', (count: number) => {
                assert.deepStrictEqual(rows, expectedRows);
                assert.strictEqual(count, expectedRows.length);
                next();
            });
    });
});
