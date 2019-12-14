import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from '../../src';

describe('Issue #77 - https://github.com/C2FO/fast-csv/issues/77', () => {
    it('should sort columns by order of headers defined when formatting a csv', next => {
        const writable = fs.createWriteStream(path.resolve(__dirname, 'assets/test.csv'), { encoding: 'utf8' });
        const csvStream = csv.format({ headers: ['second', 'first'] }).on('error', next);

        writable.on('finish', () => {
            assert.strictEqual(
                fs.readFileSync(path.resolve(__dirname, 'assets/test.csv')).toString(),
                'second,first\n2,1',
            );
            fs.unlinkSync(path.resolve(__dirname, 'assets/test.csv'));
            next();
        });

        csvStream.pipe(writable);

        [{ first: '1', second: '2' }].forEach(item => csvStream.write(item));

        csvStream.end();
    });

    it('should write headers even with no data when formatting a csv', next => {
        const writable = fs.createWriteStream(path.resolve(__dirname, 'assets/test.csv'), { encoding: 'utf8' });
        const csvStream = csv.format({ headers: ['first', 'second'] }).on('error', next);

        writable.on('finish', () => {
            assert.strictEqual(
                fs.readFileSync(path.resolve(__dirname, 'assets/test.csv')).toString(),
                'first,second\n,',
            );
            fs.unlinkSync(path.resolve(__dirname, 'assets/test.csv'));
            next();
        });

        csvStream.pipe(writable);

        [{}].forEach(item => csvStream.write(item));

        csvStream.end();
    });
});
