import * as assert from 'assert';
import * as csv from '../../src';
import RecordingStream from '../RecordingStream';


describe('Issue #97 - https://github.com/C2FO/fast-csv/issues/97', () => {
    it('should keep the original row', (next) => {
        const rs = new RecordingStream();
        const data = [
            { field1: 'a1"a', field2: 'b1"b' },
            { field1: 'a2"a', field2: 'b2"b' },
        ];

        csv
            .write(data, { quote: false, headers: true })
            .pipe(rs)
            .on('error', next)
            .on('finish', () => {
                assert.deepStrictEqual(rs.data.join(''), 'field1,field2\na1"a,b1"b\na2"a,b2"b');
                next();
            });
    });
});
