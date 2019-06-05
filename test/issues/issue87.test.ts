import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { Transform, TransformCallback } from 'stream';
import * as csv from '../../src';
import { Row } from '../../src/parser';

describe('Issue #87 - https://github.com/C2FO/fast-csv/issues/87', () => {
    class MyStream extends Transform {
        public rowCount: number;

        public constructor() {
            super({
                objectMode: true,
                highWaterMark: 16,
                transform: (...args) => this.transform(...args),
                flush: done => done(),
            });
            this.rowCount = 0;
        }

        private transform(data: Row, encoding: string, done: TransformCallback) {
            this.rowCount += 1;
            if (this.rowCount % 2 === 0) {
                setTimeout(() => done(), 10);
            } else {
                done();
            }
        }
    }

    it('should not emit end until data is flushed from source', (next) => {
        const myStream = new MyStream();

        fs
            .createReadStream(path.resolve(__dirname, './assets/issue87.csv'))
            .pipe(csv.parse({ headers: true }))
            .on('error', next)
            .pipe(myStream)
            .on('error', next)
            .on('finish', () => {
                assert.strictEqual(myStream.rowCount, 99);
                next();
            });
    });
});
