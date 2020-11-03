import * as csv from '../../src';
import { RecordingStream } from '../__fixtures__';

describe('Issue #446 - https://github.com/C2FO/fast-csv/issues/446', () => {
    it('should not quote a field that contains a single quote if it is not the quote character', () => {
        return new Promise((res, rej) => {
            const rs = new RecordingStream();
            const data: csv.RowArray[] = [["a quick' brown fox", 'jumped', 'over the lazy brown "dog"']];

            csv.write(data, {
                headers: ['header1', 'header2', 'header3'],
            })
                .pipe(rs)
                .on('error', rej)
                .on('finish', () => {
                    expect(rs.data).toEqual([
                        'header1,header2,header3',
                        `\na quick' brown fox,jumped,"over the lazy brown ""dog"""`,
                    ]);
                    res();
                });
        });
    });
});
