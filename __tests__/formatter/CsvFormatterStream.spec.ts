import * as fs from 'fs';
import * as path from 'path';
import * as csv from '../../src';
import { FormatterOptions, CsvFormatterStream } from '../../src/formatter';
import RecordingStream from '../RecordingStream';

describe('CsvFormatterStream', () => {
    const objectRows = [
        { a: 'a1', b: 'b1' },
        { a: 'a2', b: 'b2' },
    ];

    const arrayRows = [
        ['a', 'b'],
        ['a1', 'b1'],
        ['a2', 'b2'],
    ];

    const multiDimensionalRows = [
        [
            ['a', 'a1'],
            ['b', 'b1'],
        ],
        [
            ['a', 'a2'],
            ['b', 'b2'],
        ],
    ];

    const pipeToRecordingStream = (formatter: CsvFormatterStream, rows: csv.FormatterRow[]) =>
        new Promise((res, rej) => {
            const rs = new RecordingStream();
            formatter
                .on('error', e => rej(e))
                .pipe(rs)
                .on('finish', () => {
                    res(rs.data);
                });
            rows.forEach(row => formatter.write(row));
            formatter.end();
        });

    const formatRows = (rows: csv.FormatterRow[], options: csv.FormatterOptionsArgs = {}) =>
        pipeToRecordingStream(csv.format(options), rows);

    it('should write an array of arrays', () =>
        expect(formatRows(arrayRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    it('should write an array of objects', () =>
        expect(formatRows(objectRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    describe('transform option', () => {
        it('should support transforming an array of arrays', () =>
            expect(
                formatRows(arrayRows, {
                    headers: true,
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowArray).map(entry => entry.toUpperCase());
                    },
                }),
            ).resolves.toEqual(['A,B', '\nA1,B1', '\nA2,B2']));

        it('should support transforming an array of multi-dimensional arrays', () =>
            expect(
                formatRows(multiDimensionalRows, {
                    headers: true,
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowHashArray).map(entry => [entry[0], entry[1].toUpperCase()]);
                    },
                }),
            ).resolves.toEqual(['a,b', '\nA1,B1', '\nA2,B2']));

        it('should support transforming an array of objects', () =>
            expect(
                formatRows(objectRows, {
                    headers: true,
                    transform(row: csv.FormatterRowMap) {
                        return { A: row.a, B: row.b };
                    },
                }),
            ).resolves.toEqual(['A,B', '\na1,b1', '\na2,b2']));
    });
    describe('#transform', () => {
        it('should support transforming an array of arrays', async () => {
            const formatter = new CsvFormatterStream(
                new FormatterOptions({ headers: true }),
            ).transform((row: csv.FormatterRow) => (row as csv.FormatterRowArray).map(entry => entry.toUpperCase()));
            await expect(pipeToRecordingStream(formatter, arrayRows)).resolves.toEqual(['A,B', '\nA1,B1', '\nA2,B2']);
        });

        it('should support transforming an array of multi-dimensional arrays', async () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true })).transform(
                (row: csv.FormatterRow): csv.FormatterRow =>
                    (row as csv.FormatterRowHashArray).map(entry => [entry[0], entry[1].toUpperCase()]),
            );
            await expect(pipeToRecordingStream(formatter, multiDimensionalRows)).resolves.toEqual([
                'a,b',
                '\nA1,B1',
                '\nA2,B2',
            ]);
        });

        it('should support transforming an array of objects', async () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true })).transform(
                (row: csv.FormatterRow): csv.FormatterRow => ({
                    A: (row as csv.FormatterRowMap).a,
                    B: (row as csv.FormatterRowMap).b,
                }),
            );
            await expect(pipeToRecordingStream(formatter, objectRows)).resolves.toEqual(['A,B', '\na1,b1', '\na2,b2']);
        });

        it('should error if the transform fails', async () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true })).transform(
                (): csv.FormatterRow => {
                    throw new Error('Expected error');
                },
            );
            await expect(pipeToRecordingStream(formatter, objectRows)).rejects.toThrowError('Expected error');
        });
    });

    describe('rowDelimiter option', () => {
        it('should support specifying an alternate row delimiter', () =>
            expect(
                formatRows(objectRows, {
                    headers: true,
                    rowDelimiter: '\r\n',
                }),
            ).resolves.toEqual(['a,b', '\r\na1,b1', '\r\na2,b2']));

        it('should escape values that contain the alternate row delimiter', async () => {
            const rows = [
                { a: 'a\n1', b: 'b1' },
                { a: 'a\n2', b: 'b2' },
            ];
            await expect(
                formatRows(rows, {
                    headers: true,
                    rowDelimiter: '\n',
                }),
            ).resolves.toEqual(['a,b', '\n"a\n1",b1', '\n"a\n2",b2']);
        });
    });

    describe('quoteColumns option', () => {
        describe('quote all columns and headers if quoteColumns is true and quoteHeaders is false', () => {
            const opts = {
                headers: true,
                quoteColumns: true,
            };
            it('should work with objects', () =>
                expect(formatRows(objectRows, opts)).resolves.toEqual(['"a","b"', '\n"a1","b1"', '\n"a2","b2"']));

            it('should work with arrays', () =>
                expect(formatRows(arrayRows, opts)).resolves.toEqual(['"a","b"', '\n"a1","b1"', '\n"a2","b2"']));

            it('should work with multi-dimenional arrays', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual([
                    '"a","b"',
                    '\n"a1","b1"',
                    '\n"a2","b2"',
                ]));
        });

        describe('quote headers if quoteHeaders is true and not columns is quoteColumns is undefined', () => {
            const opts = { headers: true, quoteHeaders: true };
            it('should work with objects', () =>
                expect(formatRows(objectRows, opts)).resolves.toEqual(['"a","b"', '\na1,b1', '\na2,b2']));

            it('should work with arrays', () =>
                expect(formatRows(arrayRows, opts)).resolves.toEqual(['"a","b"', '\na1,b1', '\na2,b2']));

            it('should work with multi-dimensional arrays', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual(['"a","b"', '\na1,b1', '\na2,b2']));
        });

        describe('quote columns if quoteColumns is true and not quote headers if quoteHeaders is false', () => {
            const opts = { headers: true, quoteHeaders: false, quoteColumns: true };
            it('should work with objects', () =>
                expect(formatRows(objectRows, opts)).resolves.toEqual(['a,b', '\n"a1","b1"', '\n"a2","b2"']));

            it('should work with arrays', () =>
                expect(formatRows(arrayRows, opts)).resolves.toEqual(['a,b', '\n"a1","b1"', '\n"a2","b2"']));

            it('should work with multi-dimensional arrays', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual(['a,b', '\n"a1","b1"', '\n"a2","b2"']));
        });

        describe('if quoteColumns object it should only quote the specified column and header', () => {
            const opts = { headers: true, quoteColumns: { a: true } };
            it('should work with objects', () =>
                expect(formatRows(objectRows, opts)).resolves.toEqual(['"a",b', '\n"a1",b1', '\n"a2",b2']));

            it('should work with arrays', () =>
                expect(formatRows(arrayRows, opts)).resolves.toEqual(['"a",b', '\n"a1",b1', '\n"a2",b2']));

            it('should work with multi dimensional arrays', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual(['"a",b', '\n"a1",b1', '\n"a2",b2']));
        });

        describe('if quoteColumns object and quoteHeaders is false it should only quote the specified column and not the header', () => {
            const opts = {
                headers: true,
                quoteHeaders: false,
                quoteColumns: { a: true },
            };
            it('should work with objects', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual(['a,b', '\n"a1",b1', '\n"a2",b2']));

            it('should work with arrays', () =>
                expect(formatRows(arrayRows, opts)).resolves.toEqual(['a,b', '\n"a1",b1', '\n"a2",b2']));

            it('should work with multi-dimensional arrays', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual(['a,b', '\n"a1",b1', '\n"a2",b2']));
        });

        describe('if quoteColumns is an array it should only quote the specified column index', () => {
            const opts = { headers: true, quoteColumns: [true] };
            it('should work with objects', () =>
                expect(formatRows(objectRows, opts)).resolves.toEqual(['"a",b', '\n"a1",b1', '\n"a2",b2']));

            it('should work with arrays', () =>
                expect(formatRows(arrayRows, opts)).resolves.toEqual(['"a",b', '\n"a1",b1', '\n"a2",b2']));

            it('should work with multi-dimensional arrays', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual(['"a",b', '\n"a1",b1', '\n"a2",b2']));
        });

        describe('if quoteColumns is false and quoteHeaders is an object it should only quote the specified header and not the column', () => {
            const opts = {
                headers: true,
                quoteHeaders: { a: true },
                quoteColumns: false,
            };
            it('should work with object', () =>
                expect(formatRows(objectRows, opts)).resolves.toEqual(['"a",b', '\na1,b1', '\na2,b2']));

            it('should work with arrays', () =>
                expect(formatRows(arrayRows, opts)).resolves.toEqual(['"a",b', '\na1,b1', '\na2,b2']));

            it('should work with multi-dimenional arrays', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual(['"a",b', '\na1,b1', '\na2,b2']));
        });

        describe('if quoteColumns is an object and quoteHeaders is an object it should only quote the specified header and column', () => {
            const opts = {
                headers: true,
                quoteHeaders: { b: true },
                quoteColumns: { a: true },
            };
            it('should work with objects', () =>
                expect(formatRows(objectRows, opts)).resolves.toEqual(['a,"b"', '\n"a1",b1', '\n"a2",b2']));

            it('should work with arrays', () =>
                expect(formatRows(arrayRows, opts)).resolves.toEqual(['a,"b"', '\n"a1",b1', '\n"a2",b2']));

            it('should work with multi-dimensional arrays', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual(['a,"b"', '\n"a1",b1', '\n"a2",b2']));
        });

        describe('if quoteHeaders is an array and quoteColumns is an false it should only quote the specified header and not the column', () => {
            const opts = {
                headers: true,
                quoteHeaders: [false, true],
                quoteColumns: false,
            };
            it('should work with objects', () =>
                expect(formatRows(objectRows, opts)).resolves.toEqual(['a,"b"', '\na1,b1', '\na2,b2']));

            it('should work with arrays', () =>
                expect(formatRows(arrayRows, opts)).resolves.toEqual(['a,"b"', '\na1,b1', '\na2,b2']));

            it('should work with arrays of multi-dimensional arrays', () =>
                expect(formatRows(multiDimensionalRows, opts)).resolves.toEqual(['a,"b"', '\na1,b1', '\na2,b2']));
        });
    });

    describe('header option', () => {
        it('should write an array of objects without headers', () =>
            expect(formatRows(objectRows, { headers: false })).resolves.toEqual(['a1,b1', '\na2,b2']));

        it('should write an array of objects with headers', () =>
            expect(formatRows(objectRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

        it('should write an array of arrays without headers', async () => {
            const rows = [
                ['a1', 'b1'],
                ['a2', 'b2'],
            ];
            await expect(formatRows(rows, { headers: false })).resolves.toEqual(['a1,b1', '\na2,b2']);
        });

        it('should write an array of arrays with headers', () =>
            expect(formatRows(arrayRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

        it('should write an array of multi-dimensional arrays without headers', () =>
            expect(formatRows(multiDimensionalRows, { headers: false })).resolves.toEqual(['a1,b1', '\na2,b2']));

        it('should write an array of multi-dimensional arrays with headers', () =>
            expect(formatRows(multiDimensionalRows, { headers: true })).resolves.toEqual([
                'a,b',
                '\na1,b1',
                '\na2,b2',
            ]));

        it('should not write anything if headers are provided but no rows are provided', () =>
            expect(formatRows([], { headers: true })).resolves.toEqual([]));

        describe('alwaysWriteHeaders option', () => {
            it('should write the headers if rows are not provided', async () => {
                const headers = ['h1', 'h2'];
                await expect(
                    formatRows([], {
                        headers,
                        alwaysWriteHeaders: true,
                    }),
                ).resolves.toEqual([headers.join(',')]);
            });

            it('should write the headers ones if rows are provided', async () => {
                const headers = ['h1', 'h2'];
                await expect(
                    formatRows(arrayRows, {
                        headers,
                        alwaysWriteHeaders: true,
                    }),
                ).resolves.toEqual([headers.join(','), '\na,b', '\na1,b1', '\na2,b2']);
            });

            it('should fail if no headers are provided', async () => {
                await expect(formatRows([], { alwaysWriteHeaders: true })).rejects.toThrowError(
                    '`alwaysWriteHeaders` option is set to true but `headers` option not provided.',
                );
            });

            it('should write the headers and an endRowDelimiter if includeEndRowDelimiter is true', async () => {
                const headers = ['h1', 'h2'];
                await expect(
                    formatRows([], {
                        headers,
                        includeEndRowDelimiter: true,
                        alwaysWriteHeaders: true,
                    }),
                ).resolves.toEqual([headers.join(','), '\n']);
            });
        });
    });

    it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
        expect(
            formatRows(objectRows, {
                headers: true,
                includeEndRowDelimiter: true,
            }),
        ).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2', '\n']));

    it('should write a BOM character if writeBOM is true', () =>
        expect(
            formatRows(objectRows, {
                headers: true,
                writeBOM: true,
            }),
        ).resolves.toEqual(['\ufeff', 'a,b', '\na1,b1', '\na2,b2']));

    describe('.writeToString', () => {
        it('should write an array of arrays', () =>
            expect(csv.writeToString(arrayRows, { headers: true })).resolves.toEqual('a,b\na1,b1\na2,b2'));

        it('should support transforming an array of arrays', () =>
            expect(
                csv.writeToString(arrayRows, {
                    headers: true,
                    transform(row: csv.FormatterRow): csv.FormatterRow {
                        return (row as csv.FormatterRowArray).map(entry => entry.toUpperCase());
                    },
                }),
            ).resolves.toEqual('A,B\nA1,B1\nA2,B2'));

        it('should write an array of multi-dimensional arrays', () =>
            expect(csv.writeToString(multiDimensionalRows, { headers: true })).resolves.toEqual('a,b\na1,b1\na2,b2'));

        it('should support transforming an array of multi-dimensional arrays', () =>
            expect(
                csv.writeToString(multiDimensionalRows, {
                    headers: true,
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowHashArray).map(col => [col[0], col[1].toUpperCase()]);
                    },
                }),
            ).resolves.toEqual('a,b\nA1,B1\nA2,B2'));

        it('should write an array of objects', () =>
            expect(
                csv.writeToString(objectRows, {
                    headers: true,
                    transform(row: csv.FormatterRowMap) {
                        return {
                            A: row.a,
                            B: row.b,
                        };
                    },
                }),
            ).resolves.toEqual('A,B\na1,b1\na2,b2'));

        describe('header option', () => {
            it('should write an array of objects without headers', () =>
                expect(csv.writeToString(objectRows, { headers: false })).resolves.toEqual('a1,b1\na2,b2'));

            it('should write an array of objects with headers', () =>
                expect(csv.writeToString(objectRows, { headers: true })).resolves.toEqual('a,b\na1,b1\na2,b2'));

            it('should write an array of arrays without headers', async () => {
                const rows = [
                    ['a1', 'b1'],
                    ['a2', 'b2'],
                ];
                await expect(csv.writeToString(rows, { headers: false })).resolves.toEqual('a1,b1\na2,b2');
            });

            it('should write an array of arrays with headers', () =>
                expect(csv.writeToString(arrayRows, { headers: true })).resolves.toEqual('a,b\na1,b1\na2,b2'));

            it('should write an array of multi-dimensional arrays without headers', () =>
                expect(csv.writeToString(multiDimensionalRows, { headers: false })).resolves.toEqual('a1,b1\na2,b2'));

            it('should write an array of multi-dimensional arrays with headers', () =>
                expect(csv.writeToString(multiDimensionalRows, { headers: true })).resolves.toEqual(
                    'a,b\na1,b1\na2,b2',
                ));
        });

        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () =>
                expect(csv.writeToString(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual(
                    'a,b\r\na1,b1\r\na2,b2',
                ));

            it('should escape values that contain the alternate row delimiter', async () => {
                const rows = [
                    { a: 'a\t1', b: 'b1' },
                    { a: 'a\t2', b: 'b2' },
                ];
                await expect(csv.writeToString(rows, { headers: true, rowDelimiter: '\t' })).resolves.toEqual(
                    'a,b\t"a\t1",b1\t"a\t2",b2',
                );
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
            expect(csv.writeToString(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual(
                'a,b\na1,b1\na2,b2\n',
            ));
    });

    describe('.writeToBuffer', () => {
        it('should write an array of arrays', () =>
            expect(csv.writeToBuffer(arrayRows, { headers: true })).resolves.toEqual(Buffer.from('a,b\na1,b1\na2,b2')));

        it('should support transforming an array of arrays', () =>
            expect(
                csv.writeToBuffer(arrayRows, {
                    headers: true,
                    transform(row: csv.FormatterRow): csv.FormatterRow {
                        return (row as csv.FormatterRowArray).map(entry => entry.toUpperCase());
                    },
                }),
            ).resolves.toEqual(Buffer.from('A,B\nA1,B1\nA2,B2')));

        it('should write an array of multi-dimensional arrays', () =>
            expect(csv.writeToBuffer(multiDimensionalRows, { headers: true })).resolves.toEqual(
                Buffer.from('a,b\na1,b1\na2,b2'),
            ));

        it('should support transforming an array of multi-dimensional arrays', () =>
            expect(
                csv.writeToBuffer(multiDimensionalRows, {
                    headers: true,
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowHashArray).map(col => [col[0], col[1].toUpperCase()]);
                    },
                }),
            ).resolves.toEqual(Buffer.from('a,b\nA1,B1\nA2,B2')));

        it('should write an array of objects', () =>
            expect(
                csv.writeToBuffer(objectRows, {
                    headers: true,
                    transform(row: csv.FormatterRowMap): csv.FormatterRow {
                        return {
                            A: row.a,
                            B: row.b,
                        };
                    },
                }),
            ).resolves.toEqual(Buffer.from('A,B\na1,b1\na2,b2')));

        describe('header option', () => {
            it('should write an array of objects without headers', () =>
                expect(csv.writeToBuffer(objectRows, { headers: false })).resolves.toEqual(
                    Buffer.from('a1,b1\na2,b2'),
                ));

            it('should write an array of objects with headers', () =>
                expect(csv.writeToBuffer(objectRows, { headers: true })).resolves.toEqual(
                    Buffer.from('a,b\na1,b1\na2,b2'),
                ));

            it('should write an array of arrays without headers', async () => {
                const rows = [
                    ['a1', 'b1'],
                    ['a2', 'b2'],
                ];
                await expect(csv.writeToBuffer(rows, { headers: false })).resolves.toEqual(Buffer.from('a1,b1\na2,b2'));
            });

            it('should write an array of arrays with headers', () =>
                expect(csv.writeToBuffer(arrayRows, { headers: true })).resolves.toEqual(
                    Buffer.from('a,b\na1,b1\na2,b2'),
                ));

            it('should write an array of multi-dimensional arrays without headers', () =>
                expect(csv.writeToBuffer(multiDimensionalRows, { headers: false })).resolves.toEqual(
                    Buffer.from('a1,b1\na2,b2'),
                ));

            it('should write an array of multi-dimensional arrays with headers', () =>
                expect(csv.writeToBuffer(multiDimensionalRows, { headers: true })).resolves.toEqual(
                    Buffer.from('a,b\na1,b1\na2,b2'),
                ));
        });

        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () =>
                expect(csv.writeToBuffer(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual(
                    Buffer.from('a,b\r\na1,b1\r\na2,b2'),
                ));
            it('should escape values that contain the alternate row delimiter', async () => {
                const rows = [
                    { a: 'a\t1', b: 'b1' },
                    { a: 'a\t2', b: 'b2' },
                ];
                await expect(csv.writeToBuffer(rows, { headers: true, rowDelimiter: '\t' })).resolves.toEqual(
                    Buffer.from('a,b\t"a\t1",b1\t"a\t2",b2'),
                );
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
            expect(csv.writeToBuffer(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual(
                Buffer.from('a,b\na1,b1\na2,b2\n'),
            ));
    });

    describe('.write', () => {
        const writeToRecordingStream = (rows: csv.FormatterRow[], options = {}) =>
            new Promise((res, rej) => {
                const rs = new RecordingStream();
                csv.write(rows, options)
                    .on('error', rej)
                    .pipe(rs)
                    .on('finish', () => {
                        res(rs.data);
                    });
            });

        it('should write an array of arrays', () =>
            expect(writeToRecordingStream(arrayRows, { headers: true })).resolves.toEqual([
                'a,b',
                '\na1,b1',
                '\na2,b2',
            ]));

        it('should support transforming an array of arrays', () =>
            expect(
                writeToRecordingStream(arrayRows, {
                    headers: true,
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowArray).map(entry => entry.toUpperCase());
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
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowHashArray).map(col => [col[0], col[1].toUpperCase()]);
                    },
                }),
            ).resolves.toEqual(['a,b', '\nA1,B1', '\nA2,B2']));

        it('should write an array of objects', () =>
            expect(writeToRecordingStream(objectRows, { headers: true })).resolves.toEqual([
                'a,b',
                '\na1,b1',
                '\na2,b2',
            ]));

        it('should support transforming an array of objects', () =>
            expect(
                writeToRecordingStream(objectRows, {
                    headers: true,
                    transform(row: csv.FormatterRowMap) {
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
            expect(
                writeToRecordingStream(objectRows, { headers: true, includeEndRowDelimiter: true }),
            ).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2', '\n']));
    });

    describe('.writeToPath', () => {
        const writeToPath = (rows: csv.FormatterRow[], options = {}) =>
            new Promise((res, rej) => {
                const csvPath = path.resolve(__dirname, '__fixtures__', 'test_output.csv');
                csv.writeToPath(csvPath, rows, options)
                    .on('error', rej)
                    .on('finish', () => {
                        const content = fs.readFileSync(csvPath);
                        fs.unlinkSync(csvPath);
                        res(content);
                    });
            });

        it('should write an array of arrays', () =>
            expect(writeToPath(arrayRows, { headers: true })).resolves.toEqual(Buffer.from('a,b\na1,b1\na2,b2')));

        it('should write an array of objects', () =>
            expect(writeToPath(objectRows, { headers: true })).resolves.toEqual(Buffer.from('a,b\na1,b1\na2,b2')));

        it('should write an array of multi-dimensional arrays', () =>
            expect(writeToPath(multiDimensionalRows, { headers: true })).resolves.toEqual(
                Buffer.from('a,b\na1,b1\na2,b2'),
            ));

        it('should support transforming an array of arrays', () =>
            expect(
                writeToPath(arrayRows, {
                    headers: true,
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowArray).map(entry => entry.toUpperCase());
                    },
                }),
            ).resolves.toEqual(Buffer.from('A,B\nA1,B1\nA2,B2')));

        it('should transforming an array of objects', () =>
            expect(
                writeToPath(objectRows, {
                    headers: true,
                    transform(row: csv.FormatterRowMap) {
                        return {
                            A: row.a,
                            B: row.b,
                        };
                    },
                }),
            ).resolves.toEqual(Buffer.from('A,B\na1,b1\na2,b2')));

        it('should transforming an array of multi-dimensional array', () =>
            expect(
                writeToPath(multiDimensionalRows, {
                    headers: true,
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowHashArray).map(col => [col[0], col[1].toUpperCase()]);
                    },
                }),
            ).resolves.toEqual(Buffer.from('a,b\nA1,B1\nA2,B2')));

        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () =>
                expect(writeToPath(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual(
                    Buffer.from('a,b\r\na1,b1\r\na2,b2'),
                ));

            it('should escape values that contain the alternate row delimiter', async () => {
                const rows = [
                    { a: 'a\r\n1', b: 'b1' },
                    { a: 'a\r\n2', b: 'b2' },
                ];
                await expect(writeToPath(rows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual(
                    Buffer.from('a,b\r\n"a\r\n1",b1\r\n"a\r\n2",b2'),
                );
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
            expect(writeToPath(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual(
                Buffer.from('a,b\na1,b1\na2,b2\n'),
            ));
    });

    describe('.write', () => {
        const writeToRecordingStream = (rows: csv.FormatterRow[], options = {}) =>
            new Promise((res, rej) => {
                const rs = new RecordingStream();
                csv.write(rows, options)
                    .on('error', rej)
                    .pipe(rs)
                    .on('finish', () => {
                        res(rs.data);
                    });
            });

        it('should write an array of arrays', () =>
            expect(writeToRecordingStream(arrayRows, { headers: true })).resolves.toEqual([
                'a,b',
                '\na1,b1',
                '\na2,b2',
            ]));

        it('should support transforming an array of arrays', () =>
            expect(
                writeToRecordingStream(arrayRows, {
                    headers: true,
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowArray).map(entry => entry.toUpperCase());
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
                    transform(row: csv.FormatterRow) {
                        return (row as csv.FormatterRowHashArray).map(col => [col[0], col[1].toUpperCase()]);
                    },
                }),
            ).resolves.toEqual(['a,b', '\nA1,B1', '\nA2,B2']));

        it('should write an array of objects', () =>
            expect(writeToRecordingStream(objectRows, { headers: true })).resolves.toEqual([
                'a,b',
                '\na1,b1',
                '\na2,b2',
            ]));

        it('should support transforming an array of objects', () =>
            expect(
                writeToRecordingStream(objectRows, {
                    headers: true,
                    transform(row: csv.FormatterRowMap) {
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
            expect(
                writeToRecordingStream(objectRows, { headers: true, includeEndRowDelimiter: true }),
            ).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2', '\n']));
    });

    describe('.writeToStream', () => {
        const writeToStream = (rows: csv.FormatterRow[], options: csv.FormatterOptionsArgs = {}) =>
            new Promise((res, rej) => {
                const rs = new RecordingStream();
                csv.writeToStream(rs, rows, options);
                rs.on('error', rej).on('finish', () => {
                    res(rs.data);
                });
            });

        it('should write an array of arrays', () =>
            expect(writeToStream(arrayRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

        it('should write an array of objects', () =>
            expect(writeToStream(objectRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

        it('should write an array of multi-dimensional arrays', () =>
            expect(writeToStream(multiDimensionalRows, { headers: true })).resolves.toEqual([
                'a,b',
                '\na1,b1',
                '\na2,b2',
            ]));

        it('should support transforming an array of arrays', () =>
            expect(
                writeToStream(arrayRows, {
                    headers: true,
                    transform(row: csv.FormatterRow): csv.FormatterRow {
                        return (row as csv.FormatterRowArray).map(entry => entry.toUpperCase());
                    },
                }),
            ).resolves.toEqual(['A,B', '\nA1,B1', '\nA2,B2']));

        it('should transforming an array of objects', () =>
            expect(
                writeToStream(objectRows, {
                    headers: true,
                    transform(row: csv.FormatterRowMap): csv.FormatterRow {
                        return {
                            A: row.a,
                            B: row.b,
                        };
                    },
                }),
            ).resolves.toEqual(['A,B', '\na1,b1', '\na2,b2']));

        it('should transforming an array of multi-dimensional array', () =>
            expect(
                writeToStream(multiDimensionalRows, {
                    headers: true,
                    transform(row: csv.FormatterRow): csv.FormatterRow {
                        return (row as csv.FormatterRowHashArray).map(col => [col[0], col[1].toUpperCase()]);
                    },
                }),
            ).resolves.toEqual(['a,b', '\nA1,B1', '\nA2,B2']));

        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () =>
                expect(writeToStream(objectRows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual([
                    'a,b',
                    '\r\na1,b1',
                    '\r\na2,b2',
                ]));

            it('should escape values that contain the alternate row delimiter', async () => {
                const rows = [
                    { a: 'a\r\n1', b: 'b1' },
                    { a: 'a\r\n2', b: 'b2' },
                ];
                await expect(writeToStream(rows, { headers: true, rowDelimiter: '\r\n' })).resolves.toEqual([
                    'a,b',
                    '\r\n"a\r\n1",b1',
                    '\r\n"a\r\n2",b2',
                ]);
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () =>
            expect(writeToStream(objectRows, { headers: true, includeEndRowDelimiter: true })).resolves.toEqual([
                'a,b',
                '\na1,b1',
                '\na2,b2',
                '\n',
            ]));
    });
});
