import { RecordingStream } from '../__fixtures__';
import { RowArray, write } from '../../src';

describe('Issue #503 - https://github.com/C2FO/fast-csv/issues/503', () => {
    it('should emit all columns after an empty row', () => {
        return new Promise((res, rej) => {
            const rs = new RecordingStream();
            const data: RowArray[] = [[], ['something']];

            write(data, { quote: false, headers: false, writeHeaders: false })
                .pipe(rs)
                .on('error', rej)
                .on('finish', () => {
                    expect(rs.data).toEqual(['\nsomething']);
                    res();
                });
        });
    });

    it('should not assume first row is a header if header = false', () => {
        return new Promise((res, rej) => {
            const rs = new RecordingStream();
            const data: RowArray[] = [['1'], [], ['1', '2', '3']];

            write(data, { quote: false, headers: false, writeHeaders: false })
                .pipe(rs)
                .on('error', rej)
                .on('finish', () => {
                    expect(rs.data).toEqual(['1', '\n', '\n1,2,3']);
                    res();
                });
        });
    });
});
