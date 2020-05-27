import * as path from 'path';
import * as fs from 'fs';
import {
    FormatterOptionsArgs,
    Row,
    RowArray,
    RowHashArray,
    RowMap,
    write,
    writeToBuffer,
    writeToPath,
    writeToStream,
    writeToString,
} from '../src';
import { arrayRows, multiDimensionalRows, objectRows, RecordingStream } from './__fixtures__';

describe('.writeToString', () => {
    it('should write an array of arrays', () =>
        expect(writeToString(arrayRows, { headers: true })).resolves.toEqual('a,b\na1,b1\na2,b2'));

    it('should support transforming an array of arrays', () =>
        expect(
            writeToString(arrayRows, {
                headers: true,
                transform(row: Row): Row {
                    return (row as RowArray).map((entry) => entry.toUpperCase());
                },
            }),
        ).resolves.toEqual('A,B\nA1,B1\nA2,B2'));

    it('should write an array of multi-dimensional arrays', () =>
        expect(writeToString(multiDimensionalRows, { headers: true })).resolves.toEqual('a,b\na1,b1\na2,b2'));

    it('should support transforming an array of multi-dimensional arrays', () =>
        expect(
            writeToString(multiDimensionalRows, {
                headers: true,
                transform(row: Row) {
                    return (row as RowHashArray<string>).map((col) => [col[0], col[1].toUpperCase()]);
                },
            }),
        ).resolves.toEqual('a,b\nA1,B1\nA2,B2'));

    it('should write an array of objects', () =>
        expect(
            writeToString(objectRows, {
                headers: true,
                transform(row: RowMap<string>) {
                    return {
                        A: row.a,
                        B: row.b,
                    };
                },
            }),
        ).resolves.toEqual('A,B\na1,b1\na2,b2'));

    describe('header option', () => {
        it('should write an array of objects without headers', () =>
            expect(writeToString(objectRows, { headers: false })).resolves.toEqual('a1,b1\na2,b2'));

        it('should write an array of objects with headers', () =>
            expect(writeToString(objectRows, { headers: true })).resolves.toEqual('a,b\na1,b1\na2,b2'));

        it('should write an array of arrays without headers', async () => {
            const rows = [
                ['a1', 'b1'],
                ['a2', 'b2'],
            ];
            await expect(writeToString(rows, { headers: false })).resolves.toEqual('a1,b1\na2,b2');
        });

        it('should write an array of arrays with headers', () =>
            expect(writeToString(arrayRows, { headers: true })).resolves.toEqual('a,b\na1,b1\na2,b2'));

        it('should write an array of multi-dimensional arrays without headers', () =>
            expect(writeToString(multiDimensionalRows, { headers: false })).resolves.toEqual('a1,b1\na2,b2'));

        it('should write an array of multi-dimensional arrays with headers', () =>
            expect(writeToString(multiDimensionalRows, { headers: true })).resolves.toEqual('a,b\na1,b1\na2,b2'));
    });

    describe('rowDelimiter option', () => {
        it('should support specifying an alternate row delimiter', () =>
            expect(writeToString(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual(
                'a,b\r\na1,b1\r\na2,b2',
            ));

        it('should escape values that contain the alternate row delimiter', async () => {
            const rows = [
                { a: 'a\t1', b: 'b1' },
                { a: 'a\t2', b: 'b2' },
            ];
            await expect(writeToString(rows, { headers: true, rowDelimiter: '\t' })).resolves.toEqual(
                'a,b\t"a\t1",b1\t"a\t2",b2',
            );
        });
    });

    it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
        expect(writeToString(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual(
            'a,b\na1,b1\na2,b2\n',
        ));
});

describe('.writeToBuffer', () => {
    it('should write an array of arrays', () =>
        expect(writeToBuffer(arrayRows, { headers: true })).resolves.toEqual(Buffer.from('a,b\na1,b1\na2,b2')));

    it('should support transforming an array of arrays', () =>
        expect(
            writeToBuffer(arrayRows, {
                headers: true,
                transform(row: Row): Row {
                    return (row as RowArray).map((entry) => entry.toUpperCase());
                },
            }),
        ).resolves.toEqual(Buffer.from('A,B\nA1,B1\nA2,B2')));

    it('should write an array of multi-dimensional arrays', () =>
        expect(writeToBuffer(multiDimensionalRows, { headers: true })).resolves.toEqual(
            Buffer.from('a,b\na1,b1\na2,b2'),
        ));

    it('should support transforming an array of multi-dimensional arrays', () =>
        expect(
            writeToBuffer(multiDimensionalRows, {
                headers: true,
                transform(row: Row) {
                    return (row as RowHashArray<string>).map((col) => [col[0], col[1].toUpperCase()]);
                },
            }),
        ).resolves.toEqual(Buffer.from('a,b\nA1,B1\nA2,B2')));

    it('should write an array of objects', () =>
        expect(
            writeToBuffer(objectRows, {
                headers: true,
                transform(row: RowMap<string>): Row {
                    return {
                        A: row.a,
                        B: row.b,
                    };
                },
            }),
        ).resolves.toEqual(Buffer.from('A,B\na1,b1\na2,b2')));

    describe('header option', () => {
        it('should write an array of objects without headers', () =>
            expect(writeToBuffer(objectRows, { headers: false })).resolves.toEqual(Buffer.from('a1,b1\na2,b2')));

        it('should write an array of objects with headers', () =>
            expect(writeToBuffer(objectRows, { headers: true })).resolves.toEqual(Buffer.from('a,b\na1,b1\na2,b2')));

        it('should write an array of arrays without headers', async () => {
            const rows = [
                ['a1', 'b1'],
                ['a2', 'b2'],
            ];
            await expect(writeToBuffer(rows, { headers: false })).resolves.toEqual(Buffer.from('a1,b1\na2,b2'));
        });

        it('should write an array of arrays with headers', () =>
            expect(writeToBuffer(arrayRows, { headers: true })).resolves.toEqual(Buffer.from('a,b\na1,b1\na2,b2')));

        it('should write an array of multi-dimensional arrays without headers', () =>
            expect(writeToBuffer(multiDimensionalRows, { headers: false })).resolves.toEqual(
                Buffer.from('a1,b1\na2,b2'),
            ));

        it('should write an array of multi-dimensional arrays with headers', () =>
            expect(writeToBuffer(multiDimensionalRows, { headers: true })).resolves.toEqual(
                Buffer.from('a,b\na1,b1\na2,b2'),
            ));
    });

    describe('rowDelimiter option', () => {
        it('should support specifying an alternate row delimiter', () =>
            expect(writeToBuffer(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual(
                Buffer.from('a,b\r\na1,b1\r\na2,b2'),
            ));
        it('should escape values that contain the alternate row delimiter', async () => {
            const rows = [
                { a: 'a\t1', b: 'b1' },
                { a: 'a\t2', b: 'b2' },
            ];
            await expect(writeToBuffer(rows, { headers: true, rowDelimiter: '\t' })).resolves.toEqual(
                Buffer.from('a,b\t"a\t1",b1\t"a\t2",b2'),
            );
        });
    });

    it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
        expect(writeToBuffer(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual(
            Buffer.from('a,b\na1,b1\na2,b2\n'),
        ));
});

describe('.write', () => {
    const writeToRecordingStream = (rows: Row[], options = {}) =>
        new Promise((res, rej) => {
            const rs = new RecordingStream();
            write(rows, options)
                .on('error', rej)
                .pipe(rs)
                .on('finish', () => {
                    res(rs.data);
                });
        });

    it('should write an array of arrays', () =>
        expect(writeToRecordingStream(arrayRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    it('should support transforming an array of arrays', () =>
        expect(
            writeToRecordingStream(arrayRows, {
                headers: true,
                transform(row: Row) {
                    return (row as RowArray).map((entry) => entry.toUpperCase());
                },
            }),
        ).resolves.toEqual(['A,B', '\nA1,B1', '\nA2,B2']));

    it('should write an array of multi-dimensional arrays', () =>
        expect(writeToRecordingStream(multiDimensionalRows, { headers: true })).resolves.toEqual([
            'a,b',
            '\na1,b1',
            '\na2,b2',
        ]));

    it('should support transforming an array of multi-dimensional arrays', () =>
        expect(
            writeToRecordingStream(multiDimensionalRows, {
                headers: true,
                transform(row: Row) {
                    return (row as RowHashArray<string>).map((col) => [col[0], col[1].toUpperCase()]);
                },
            }),
        ).resolves.toEqual(['a,b', '\nA1,B1', '\nA2,B2']));

    it('should write an array of objects', () =>
        expect(writeToRecordingStream(objectRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    it('should support transforming an array of objects', () =>
        expect(
            writeToRecordingStream(objectRows, {
                headers: true,
                transform(row: RowMap<string>) {
                    return {
                        A: row.a,
                        B: row.b,
                    };
                },
            }),
        ).resolves.toEqual(['A,B', '\na1,b1', '\na2,b2']));

    describe('rowDelimiter option', () => {
        it('should support specifying an alternate row delimiter', () =>
            expect(writeToRecordingStream(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual([
                'a,b',
                '\r\na1,b1',
                '\r\na2,b2',
            ]));

        it('should escape values that contain the alternate row delimiter', async () => {
            const rows = [
                { a: 'a\n1', b: 'b1' },
                { a: 'a\n2', b: 'b2' },
            ];
            await expect(writeToRecordingStream(rows, { headers: true, rowDelimiter: '\n' })).resolves.toEqual([
                'a,b',
                '\n"a\n1",b1',
                '\n"a\n2",b2',
            ]);
        });
    });

    it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
        expect(writeToRecordingStream(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual([
            'a,b',
            '\na1,b1',
            '\na2,b2',
            '\n',
        ]));
});

describe('.writeToPath', () => {
    const writeRowsToPath = (rows: Row[], options = {}) =>
        new Promise((res, rej) => {
            const csvPath = path.resolve(__dirname, '__fixtures__', 'test_output.csv');
            writeToPath(csvPath, rows, options)
                .on('error', rej)
                .on('finish', () => {
                    const content = fs.readFileSync(csvPath);
                    fs.unlinkSync(csvPath);
                    res(content);
                });
        });

    it('should write an array of arrays', () =>
        expect(writeRowsToPath(arrayRows, { headers: true })).resolves.toEqual(Buffer.from('a,b\na1,b1\na2,b2')));

    it('should write an array of objects', () =>
        expect(writeRowsToPath(objectRows, { headers: true })).resolves.toEqual(Buffer.from('a,b\na1,b1\na2,b2')));

    it('should write an array of multi-dimensional arrays', () =>
        expect(writeRowsToPath(multiDimensionalRows, { headers: true })).resolves.toEqual(
            Buffer.from('a,b\na1,b1\na2,b2'),
        ));

    it('should support transforming an array of arrays', () =>
        expect(
            writeRowsToPath(arrayRows, {
                headers: true,
                transform(row: Row) {
                    return (row as RowArray).map((entry) => entry.toUpperCase());
                },
            }),
        ).resolves.toEqual(Buffer.from('A,B\nA1,B1\nA2,B2')));

    it('should transforming an array of objects', () =>
        expect(
            writeRowsToPath(objectRows, {
                headers: true,
                transform(row: RowMap<string>) {
                    return {
                        A: row.a,
                        B: row.b,
                    };
                },
            }),
        ).resolves.toEqual(Buffer.from('A,B\na1,b1\na2,b2')));

    it('should transforming an array of multi-dimensional array', () =>
        expect(
            writeRowsToPath(multiDimensionalRows, {
                headers: true,
                transform(row: Row) {
                    return (row as RowHashArray<string>).map((col) => [col[0], col[1].toUpperCase()]);
                },
            }),
        ).resolves.toEqual(Buffer.from('a,b\nA1,B1\nA2,B2')));

    describe('rowDelimiter option', () => {
        it('should support specifying an alternate row delimiter', () =>
            expect(writeRowsToPath(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual(
                Buffer.from('a,b\r\na1,b1\r\na2,b2'),
            ));

        it('should escape values that contain the alternate row delimiter', async () => {
            const rows = [
                { a: 'a\r\n1', b: 'b1' },
                { a: 'a\r\n2', b: 'b2' },
            ];
            await expect(writeRowsToPath(rows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual(
                Buffer.from('a,b\r\n"a\r\n1",b1\r\n"a\r\n2",b2'),
            );
        });
    });

    it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
        expect(writeRowsToPath(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual(
            Buffer.from('a,b\na1,b1\na2,b2\n'),
        ));
});

describe('format.write', () => {
    const writeToRecordingStream = (rows: Row[], options = {}) =>
        new Promise((res, rej) => {
            const rs = new RecordingStream();
            write(rows, options)
                .on('error', rej)
                .pipe(rs)
                .on('finish', () => {
                    res(rs.data);
                });
        });

    it('should write an array of arrays', () =>
        expect(writeToRecordingStream(arrayRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    it('should support transforming an array of arrays', () =>
        expect(
            writeToRecordingStream(arrayRows, {
                headers: true,
                transform(row: Row) {
                    return (row as RowArray).map((entry) => entry.toUpperCase());
                },
            }),
        ).resolves.toEqual(['A,B', '\nA1,B1', '\nA2,B2']));

    it('should write an array of multi-dimensional arrays', () =>
        expect(writeToRecordingStream(multiDimensionalRows, { headers: true })).resolves.toEqual([
            'a,b',
            '\na1,b1',
            '\na2,b2',
        ]));

    it('should support transforming an array of multi-dimensional arrays', () =>
        expect(
            writeToRecordingStream(multiDimensionalRows, {
                headers: true,
                transform(row: Row) {
                    return (row as RowHashArray<string>).map((col) => [col[0], col[1].toUpperCase()]);
                },
            }),
        ).resolves.toEqual(['a,b', '\nA1,B1', '\nA2,B2']));

    it('should write an array of objects', () =>
        expect(writeToRecordingStream(objectRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    it('should support transforming an array of objects', () =>
        expect(
            writeToRecordingStream(objectRows, {
                headers: true,
                transform(row: RowMap<string>) {
                    return {
                        A: row.a,
                        B: row.b,
                    };
                },
            }),
        ).resolves.toEqual(['A,B', '\na1,b1', '\na2,b2']));

    describe('rowDelimiter option', () => {
        it('should support specifying an alternate row delimiter', () =>
            expect(writeToRecordingStream(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual([
                'a,b',
                '\r\na1,b1',
                '\r\na2,b2',
            ]));

        it('should escape values that contain the alternate row delimiter', async () => {
            const rows = [
                { a: 'a\n1', b: 'b1' },
                { a: 'a\n2', b: 'b2' },
            ];
            await expect(writeToRecordingStream(rows, { headers: true, rowDelimiter: '\n' })).resolves.toEqual([
                'a,b',
                '\n"a\n1",b1',
                '\n"a\n2",b2',
            ]);
        });
    });

    it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
        expect(writeToRecordingStream(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual([
            'a,b',
            '\na1,b1',
            '\na2,b2',
            '\n',
        ]));
});

describe('.writeToStream', () => {
    const writeRowsToStream = <I extends Row, O extends Row>(rows: I[], options: FormatterOptionsArgs<I, O> = {}) =>
        new Promise((res, rej) => {
            const rs = new RecordingStream();
            writeToStream(rs, rows, options);
            rs.on('error', rej).on('finish', () => {
                res(rs.data);
            });
        });

    it('should write an array of arrays', () =>
        expect(writeRowsToStream(arrayRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    it('should write an array of objects', () =>
        expect(writeRowsToStream(objectRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    it('should write an array of multi-dimensional arrays', () =>
        expect(writeRowsToStream(multiDimensionalRows, { headers: true })).resolves.toEqual([
            'a,b',
            '\na1,b1',
            '\na2,b2',
        ]));

    it('should support transforming an array of arrays', () =>
        expect(
            writeRowsToStream(arrayRows, {
                headers: true,
                transform(row: Row): Row {
                    return (row as RowArray).map((entry) => entry.toUpperCase());
                },
            }),
        ).resolves.toEqual(['A,B', '\nA1,B1', '\nA2,B2']));

    it('should transforming an array of objects', () =>
        expect(
            writeRowsToStream(objectRows, {
                headers: true,
                transform(row: RowMap<string>): Row {
                    return {
                        A: row.a,
                        B: row.b,
                    };
                },
            }),
        ).resolves.toEqual(['A,B', '\na1,b1', '\na2,b2']));

    it('should transforming an array of multi-dimensional array', () =>
        expect(
            writeRowsToStream(multiDimensionalRows, {
                headers: true,
                transform(row: Row): Row {
                    return (row as RowHashArray<string>).map((col) => [col[0], col[1].toUpperCase()]);
                },
            }),
        ).resolves.toEqual(['a,b', '\nA1,B1', '\nA2,B2']));

    describe('rowDelimiter option', () => {
        it('should support specifying an alternate row delimiter', () =>
            expect(writeRowsToStream(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual([
                'a,b',
                '\r\na1,b1',
                '\r\na2,b2',
            ]));

        it('should escape values that contain the alternate row delimiter', async () => {
            const rows = [
                { a: 'a\r\n1', b: 'b1' },
                { a: 'a\r\n2', b: 'b2' },
            ];
            await expect(writeRowsToStream(rows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual([
                'a,b',
                '\r\n"a\r\n1",b1',
                '\r\n"a\r\n2",b2',
            ]);
        });
    });

    it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
        expect(writeRowsToStream(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual([
            'a,b',
            '\na1,b1',
            '\na2,b2',
            '\n',
        ]));
});
