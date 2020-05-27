import * as fs from 'fs';
import * as path from 'path';
import * as csv from '../../src';

describe('Issue #77 - https://github.com/C2FO/fast-csv/issues/77', () => {
    it('should sort columns by order of headers defined when formatting a csv', () => {
        return new Promise((res, rej) => {
            const writable = fs.createWriteStream(path.resolve(__dirname, '__fixtures__/test.csv'), {
                encoding: 'utf8',
            });
            const csvStream = csv.format({ headers: ['second', 'first'] }).on('error', rej);

            writable.on('finish', () => {
                expect(fs.readFileSync(path.resolve(__dirname, '__fixtures__', 'test.csv'))).toEqual(
                    Buffer.from('second,first\n2,1'),
                );
                fs.unlinkSync(path.resolve(__dirname, '__fixtures__', 'test.csv'));
                res();
            });

            csvStream.pipe(writable);

            [{ first: '1', second: '2' }].forEach((item) => csvStream.write(item));

            csvStream.end();
        });
    });

    it('should write headers even with no data when formatting a csv', () => {
        return new Promise((res, rej) => {
            const writable = fs.createWriteStream(path.resolve(__dirname, '__fixtures__/test.csv'), {
                encoding: 'utf8',
            });
            const csvStream = csv.format({ headers: ['first', 'second'] }).on('error', rej);

            writable.on('finish', () => {
                expect(fs.readFileSync(path.resolve(__dirname, '__fixtures__/test.csv'))).toEqual(
                    Buffer.from('first,second\n,'),
                );
                fs.unlinkSync(path.resolve(__dirname, '__fixtures__/test.csv'));
                res();
            });

            csvStream.pipe(writable);

            [{}].forEach((item) => csvStream.write(item));

            csvStream.end();
        });
    });
});
