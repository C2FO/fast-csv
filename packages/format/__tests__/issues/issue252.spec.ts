import * as csv from '../../src';
import { RecordingStream } from '../__fixtures__';

describe('Issue #252 - https://github.com/C2FO/fast-csv/issues/252', () => {
    it('should keep the original row', () => {
        return new Promise((res, rej) => {
            const rs = new RecordingStream();
            const data: csv.RowArray[] = [
                ['a', 'b', 'c'],
                ['d', 'e', 'f'],
            ];

            csv.write(data, {
                headers: ['header1', 'header2', 'header3'],
            })
                .pipe(rs)
                .on('error', rej)
                .on('finish', () => {
                    expect(rs.data.join('')).toBe('header1,header2,header3\na,b,c\nd,e,f');
                    res();
                });
        });
    });
});
