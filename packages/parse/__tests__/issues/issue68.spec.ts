import * as path from 'path';
import * as domain from 'domain';
import * as csv from '../../src';

describe('Issue #68 - https://github.com/C2FO/fast-csv/issues/68', () => {
    it('should handle bubble up parse errors properly', () => {
        return new Promise((res) => {
            const d = domain.create();
            let called = false;
            d.on('error', (err: Error) => {
                d.exit();
                if (called) {
                    return;
                }
                called = true;
                expect(err.message).toMatch(/^Parse Error/);
                res();
            });
            d.run(() =>
                csv
                    .parseFile(path.resolve(__dirname, '__fixtures__', 'issue68-invalid.tsv'), {
                        headers: true,
                        delimiter: '\t',
                    })
                    .on('data', () => null),
            );
        });
    });

    it('should handle bubble up data errors properly', () => {
        return new Promise((res) => {
            const d = domain.create();
            let called = false;
            d.on('error', (err: Error) => {
                d.exit();
                if (called) {
                    throw err;
                }
                called = true;
                expect(err.message).toBe('Data error');
                res();
            });
            d.run(() => {
                let count = 0;
                csv.parseFile(path.resolve(__dirname, '__fixtures__', 'issue68.tsv'), {
                    headers: true,
                    delimiter: '\t',
                }).on('data', () => {
                    count += 1;
                    if (count % 1001 === 0) {
                        throw new Error('Data error');
                    }
                });
            });
        });
    });
});
