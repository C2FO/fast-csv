import { EOL } from 'os';
import * as csv from '../../src';

describe('Issue #131 - https://github.com/C2FO/fast-csv/issues/131', () => {
    const csvWithBom = [
        '\ufefffirst_name,last_name,email_address,address',
        'First1,Last1,email1@email.com,"1 Street St, State ST, 88888"',
    ].join(EOL);

    it('should parse a csv with a UTF-8 Byte Order Mark', () =>
        new Promise((res, rej) => {
            const actual: csv.RowMap[] = [];
            csv.parseString(csvWithBom, { headers: true })
                .on('error', rej)
                .on('data', (data) => actual.push(data))
                .on('end', (count: number) => {
                    expect(actual[0].first_name).toBe('First1');
                    expect(count).toBe(actual.length);
                    res(() => {});
                });
        }));
});
