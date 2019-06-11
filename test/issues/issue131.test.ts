import * as assert from 'assert';
import { EOL } from 'os';
import * as csv from '../../src';
import { RowMap } from '../../src/parser';

describe('Issue #131 - https://github.com/C2FO/fast-csv/issues/131', () => {
    const csvWithBom = [
        '\ufefffirst_name,last_name,email_address,address',
        'First1,Last1,email1@email.com,"1 Street St, State ST, 88888"',
    ].join(EOL);

    it('should parse a csv with a UTF-8 Byte Order Mark', (next) => {
        const actual: RowMap[] = [];
        csv
            .parseString(csvWithBom, { headers: true })
            .on('data', data => actual.push(data))
            .on('end', (count: number) => {
                assert.deepStrictEqual(actual[0].first_name, 'First1');
                assert.strictEqual(count, actual.length);
                next();
            });
    });
});
