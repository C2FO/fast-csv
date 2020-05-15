import * as domain from 'domain';
import { EOL } from 'os';
import * as csv from '../../src';

describe('Issue #93 - https://github.com/C2FO/fast-csv/issues/93', () => {
    const csvContent = ['a,b', 'c,d', 'e,f'].join(EOL);

    it('should not catch errors thrown in end with headers enabled', (next) => {
        const d = domain.create();
        let called = false;
        d.on('error', (err) => {
            d.exit();
            if (called) {
                throw err;
            }
            called = true;
            expect(err.message).toBe('End error');
            next();
        });
        d.run(() =>
            csv
                .parseString(csvContent, { headers: true, delimiter: '\t' })
                .on('error', () => next(new Error('Should not get here!')))
                .on('data', () => {
                    /* do nothing */
                })
                .on('end', () => {
                    throw new Error('End error');
                }),
        );
    });

    it('should not catch errors thrown in end with headers disabled', (next) => {
        const d = domain.create();
        let called = false;
        d.on('error', (err) => {
            d.exit();
            if (called) {
                throw err;
            }
            called = true;
            expect(err.message).toBe('End error');
            next();
        });
        d.run(() =>
            csv
                .parseString(csvContent, { headers: false })
                .on('error', () => next(new Error('Should not get here!')))
                .on('data', () => {
                    /* do nothing */
                })
                .on('end', () => {
                    throw new Error('End error');
                }),
        );
    });
});
