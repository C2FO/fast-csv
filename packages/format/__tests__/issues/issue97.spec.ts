import { RecordingStream } from '../__fixtures__';
import { RowMap, write } from '../../src';

describe('Issue #97 - https://github.com/C2FO/fast-csv/issues/97', () => {
    it('should keep the original row', () => {
        return new Promise((res, rej) => {
            const rs = new RecordingStream();
            const data: RowMap[] = [
                { field1: 'a1"a', field2: 'b1"b' },
                { field1: 'a2"a', field2: 'b2"b' },
            ];

            write(data, { quote: false, headers: true })
                .pipe(rs)
                .on('error', rej)
                .on('finish', () => {
                    expect(rs.data.join('')).toBe('field1,field2\na1"a,b1"b\na2"a,b2"b');
                    res();
                });
        });
    });
});
