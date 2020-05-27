import {
    FormatterOptionsArgs,
    Row,
    RowArray,
    RowMap,
    RowHashArray,
    CsvFormatterStream,
    FormatterOptions,
} from '../src';
import { arrayRows, multiDimensionalRows, objectRows, RecordingStream } from './__fixtures__';

describe('CsvFormatterStream', () => {
    const pipeToRecordingStream = <I extends Row, O extends Row>(formatter: CsvFormatterStream<I, O>, rows: Row[]) =>
        new Promise((res, rej) => {
            const rs = new RecordingStream();
            formatter
                .on('error', (e) => rej(e))
                .pipe(rs)
                .on('finish', () => {
                    res(rs.data);
                });
            rows.forEach((row) => formatter.write(row));
            formatter.end();
        });

    const formatRows = <I extends Row, O extends Row>(rows: Row[], options: FormatterOptionsArgs<I, O> = {}) =>
        pipeToRecordingStream(new CsvFormatterStream(new FormatterOptions(options)), rows);

    it('should write an array of arrays', () =>
        expect(formatRows(arrayRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    it('should write an array of objects', () =>
        expect(formatRows(objectRows, { headers: true })).resolves.toEqual(['a,b', '\na1,b1', '\na2,b2']));

    describe('transform option', () => {
        it('should support transforming an array of arrays', () =>
            expect(
                formatRows(arrayRows, {
                    headers: true,
                    transform(row: Row) {
                        return (row as RowArray).map((entry) => entry.toUpperCase());
                    },
                }),
            ).resolves.toEqual(['A,B', '\nA1,B1', '\nA2,B2']));

        it('should support transforming an array of multi-dimensional arrays', () =>
            expect(
                formatRows(multiDimensionalRows, {
                    headers: true,
                    transform(row: Row) {
                        return (row as RowHashArray<string>).map((entry) => [entry[0], entry[1].toUpperCase()]);
                    },
                }),
            ).resolves.toEqual(['a,b', '\nA1,B1', '\nA2,B2']));

        it('should support transforming an array of objects', () =>
            expect(
                formatRows(objectRows, {
                    headers: true,
                    transform(row: RowMap<string>) {
                        return { A: row.a, B: row.b };
                    },
                }),
            ).resolves.toEqual(['A,B', '\na1,b1', '\na2,b2']));
    });
    describe('#transform', () => {
        it('should support transforming an array of arrays', async () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true })).transform((row: Row) =>
                (row as RowArray).map((entry) => entry.toUpperCase()),
            );
            await expect(pipeToRecordingStream(formatter, arrayRows)).resolves.toEqual(['A,B', '\nA1,B1', '\nA2,B2']);
        });

        it('should support transforming an array of multi-dimensional arrays', async () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true })).transform(
                (row: Row): Row => (row as RowHashArray<string>).map((entry) => [entry[0], entry[1].toUpperCase()]),
            );
            await expect(pipeToRecordingStream(formatter, multiDimensionalRows)).resolves.toEqual([
                'a,b',
                '\nA1,B1',
                '\nA2,B2',
            ]);
        });

        it('should support transforming an array of objects', async () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true })).transform(
                (row: Row): Row => ({
                    A: (row as RowMap<string>).a,
                    B: (row as RowMap<string>).b,
                }),
            );
            await expect(pipeToRecordingStream(formatter, objectRows)).resolves.toEqual(['A,B', '\na1,b1', '\na2,b2']);
        });

        it('should error if the transform fails', async () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true })).transform(
                (): Row => {
                    throw new Error('Expected error');
                },
            );
            await expect(pipeToRecordingStream(formatter, objectRows)).rejects.toThrow('Expected error');
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
                await expect(formatRows([], { alwaysWriteHeaders: true })).rejects.toThrow(
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
});
