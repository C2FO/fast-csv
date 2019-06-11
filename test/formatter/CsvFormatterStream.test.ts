import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from '../../src';
import {
    FormatterOptions, CsvFormatterStream, Row, RowArray, RowHashArray, RowMap, FormatterOptionsArgs,
} from '../../src/formatter';
import RecordingStream from '../RecordingStream';


describe('CsvFormatterStream', () => {
    const objectRows = [
        { a: 'a1', b: 'b1' },
        { a: 'a2', b: 'b2' },
    ];

    const arrayRows = [
        [ 'a', 'b' ],
        [ 'a1', 'b1' ],
        [ 'a2', 'b2' ],
    ];

    const multiDimensionalRows = [
        [ [ 'a', 'a1' ], [ 'b', 'b1' ] ],
        [ [ 'a', 'a2' ], [ 'b', 'b2' ] ],
    ];

    const pipeToRecordingStream = (formatter: CsvFormatterStream, rows: Row[]) => new Promise((res, rej) => {
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

    const formatRows = (rows: Row[], options: FormatterOptionsArgs = {}) => pipeToRecordingStream(csv.format(options), rows);

    it('should write an array of arrays', () => formatRows(arrayRows, { headers: true })
        .then(written => assert.deepStrictEqual(written, [ 'a,b', '\na1,b1', '\na2,b2' ])));


    it('should write an array of objects', () => formatRows(objectRows, { headers: true })
        .then(written => assert.deepStrictEqual(written, [ 'a,b', '\na1,b1', '\na2,b2' ])));

    describe('transform option', () => {
        it('should support transforming an array of arrays', () => formatRows(arrayRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowArray).map(entry => entry.toUpperCase());
            },
        }).then(written => assert.deepStrictEqual(written, [ 'A,B', '\nA1,B1', '\nA2,B2' ])));

        it('should support transforming an array of multi-dimensional arrays', () => formatRows(multiDimensionalRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowHashArray).map(entry => [ entry[0], entry[1].toUpperCase() ]);
            },
        }).then((written) => {
            assert.deepStrictEqual(written, [ 'a,b', '\nA1,B1', '\nA2,B2' ]);
        }));

        it('should support transforming an array of objects', () => formatRows(objectRows, {
            headers: true,
            transform(row: RowMap) {
                return { A: row.a, B: row.b };
            },
        }).then(written => assert.deepStrictEqual(written, [ 'A,B', '\na1,b1', '\na2,b2' ])));
    });
    describe('#transform', () => {
        it('should support transforming an array of arrays', () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true }))
                .transform((row: Row) => (row as RowArray).map(entry => entry.toUpperCase()));
            return pipeToRecordingStream(formatter, arrayRows)
                .then(written => assert.deepStrictEqual(written, [ 'A,B', '\nA1,B1', '\nA2,B2' ]));
        });

        it('should support transforming an array of multi-dimensional arrays', () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true }))
                .transform((row: Row): Row => (row as RowHashArray).map(entry => [ entry[0], entry[1].toUpperCase() ]));
            return pipeToRecordingStream(formatter, multiDimensionalRows)
                .then(written => assert.deepStrictEqual(written, [ 'a,b', '\nA1,B1', '\nA2,B2' ]));
        });

        it('should support transforming an array of objects', () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true }))
                .transform((row: Row): Row => ({ A: (row as RowMap).a, B: (row as RowMap).b }));
            return pipeToRecordingStream(formatter, objectRows)
                .then(written => assert.deepStrictEqual(written, [ 'A,B', '\na1,b1', '\na2,b2' ]));
        });

        it('should error if the transform fails', () => {
            const formatter = new CsvFormatterStream(new FormatterOptions({ headers: true }))
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .transform((row: Row): Row => {
                    throw new Error('Expected error');
                });
            return pipeToRecordingStream(formatter, objectRows)
                .then(() => assert.fail('Should have failed'), (err) => {
                    assert.strictEqual(err.message, 'Expected error');
                });
        });
    });


    describe('rowDelimiter option', () => {
        it('should support specifying an alternate row delimiter', () => formatRows(objectRows, {
            headers: true,
            rowDelimiter: '\r\n',
        }).then(written => assert.deepStrictEqual(written, [ 'a,b', '\r\na1,b1', '\r\na2,b2' ])));

        it('should escape values that contain the alternate row delimiter', () => {
            const rows = [
                { a: 'a\n1', b: 'b1' },
                { a: 'a\n2', b: 'b2' },
            ];
            return formatRows(rows, { headers: true, rowDelimiter: '\n' })
                .then(written => assert.deepStrictEqual(written, [ 'a,b', '\n"a\n1",b1', '\n"a\n2",b2' ]));
        });
    });

    describe('quoteColumns option', () => {
        describe('quote all columns and headers if quoteColumns is true and quoteHeaders is false', () => {
            it('should work with objects', () => formatRows(objectRows, { headers: true, quoteColumns: true })
                .then(written => assert.deepStrictEqual(written, [ '"a","b"', '\n"a1","b1"', '\n"a2","b2"' ])));

            it('should work with arrays', () => formatRows(arrayRows, { headers: true, quoteColumns: true })
                .then(written => assert.deepStrictEqual(written, [ '"a","b"', '\n"a1","b1"', '\n"a2","b2"' ])));

            it('should work with multi-dimenional arrays', () => formatRows(multiDimensionalRows, { headers: true, quoteColumns: true })
                .then(written => assert.deepStrictEqual(written, [ '"a","b"', '\n"a1","b1"', '\n"a2","b2"' ])));
        });

        describe('quote headers if quoteHeaders is true and not columns is quoteColumns is undefined', () => {
            it('should work with objects', () => formatRows(objectRows, { headers: true, quoteHeaders: true })
                .then(written => assert.deepStrictEqual(written, [ '"a","b"', '\na1,b1', '\na2,b2' ])));

            it('should work with arrays', () => formatRows(arrayRows, { headers: true, quoteHeaders: true })
                .then(written => assert.deepStrictEqual(written, [ '"a","b"', '\na1,b1', '\na2,b2' ])));

            it('should work with multi-dimensional arrays', () => formatRows(multiDimensionalRows, { headers: true, quoteHeaders: true })
                .then(written => assert.deepStrictEqual(written, [ '"a","b"', '\na1,b1', '\na2,b2' ])));
        });

        describe('quote columns if quoteColumns is true and not quote headers if quoteHeaders is false', () => {
            it('should work with objects', () => formatRows(objectRows, { headers: true, quoteHeaders: false, quoteColumns: true })
                .then(written => assert.deepStrictEqual(written, [ 'a,b', '\n"a1","b1"', '\n"a2","b2"' ])));

            it('should work with arrays', () => formatRows(arrayRows, { headers: true, quoteHeaders: false, quoteColumns: true })
                .then(written => assert.deepStrictEqual(written, [ 'a,b', '\n"a1","b1"', '\n"a2","b2"' ])));

            it('should work with multi-dimensional arrays', () => formatRows(multiDimensionalRows, { headers: true, quoteHeaders: false, quoteColumns: true })
                .then(written => assert.deepStrictEqual(written, [ 'a,b', '\n"a1","b1"', '\n"a2","b2"' ])));
        });

        describe('if quoteColumns object it should only quote the specified column and header', () => {
            it('should work with objects', () => formatRows(objectRows, { headers: true, quoteColumns: { a: true } })
                .then(written => assert.deepStrictEqual(written, [ '"a",b', '\n"a1",b1', '\n"a2",b2' ])));

            it('should work with arrays', () => formatRows(arrayRows, { headers: true, quoteColumns: { a: true } })
                .then(written => assert.deepStrictEqual(written, [ '"a",b', '\n"a1",b1', '\n"a2",b2' ])));

            it('should work with multi dimensional arrays', () => formatRows(multiDimensionalRows, { headers: true, quoteColumns: { a: true } })
                .then(written => assert.deepStrictEqual(written, [ '"a",b', '\n"a1",b1', '\n"a2",b2' ])));
        });

        describe('if quoteColumns object and quoteHeaders is false it should only quote the specified column and not the header', () => {
            it('should work with objects', () => formatRows(multiDimensionalRows, { headers: true, quoteHeaders: false, quoteColumns: { a: true } })
                .then(written => assert.deepStrictEqual(written, [ 'a,b', '\n"a1",b1', '\n"a2",b2' ])));

            it('should work with arrays', () => formatRows(arrayRows, { headers: true, quoteHeaders: false, quoteColumns: { a: true } })
                .then(written => assert.deepStrictEqual(written, [ 'a,b', '\n"a1",b1', '\n"a2",b2' ])));

            it('should work with multi-dimensional arrays', () => formatRows(multiDimensionalRows, { headers: true, quoteHeaders: false, quoteColumns: { a: true } })
                .then(written => assert.deepStrictEqual(written, [ 'a,b', '\n"a1",b1', '\n"a2",b2' ])));
        });

        describe('if quoteColumns is an array it should only quote the specified column index', () => {
            it('should work with objects', () => formatRows(objectRows, { headers: true, quoteColumns: [ true ] })
                .then(written => assert.deepStrictEqual(written, [ '"a",b', '\n"a1",b1', '\n"a2",b2' ])));

            it('should work with arrays', () => formatRows(arrayRows, { headers: true, quoteColumns: [ true ] })
                .then(written => assert.deepStrictEqual(written, [ '"a",b', '\n"a1",b1', '\n"a2",b2' ])));

            it('should work with multi-dimensional arrays', () => formatRows(multiDimensionalRows, { headers: true, quoteColumns: [ true ] })
                .then(written => assert.deepStrictEqual(written, [ '"a",b', '\n"a1",b1', '\n"a2",b2' ])));
        });

        describe('if quoteColumns is false and quoteHeaders is an object it should only quote the specified header and not the column', () => {
            it('should work with object', () => formatRows(objectRows, { headers: true, quoteHeaders: { a: true }, quoteColumns: false })
                .then(written => assert.deepStrictEqual(written, [ '"a",b', '\na1,b1', '\na2,b2' ])));

            it('should work with arrays', () => formatRows(arrayRows, { headers: true, quoteHeaders: { a: true }, quoteColumns: false })
                .then(written => assert.deepStrictEqual(written, [ '"a",b', '\na1,b1', '\na2,b2' ])));

            it('should work with multi-dimenional arrays', () => formatRows(multiDimensionalRows, { headers: true, quoteHeaders: { a: true }, quoteColumns: false })
                .then(written => assert.deepStrictEqual(written, [ '"a",b', '\na1,b1', '\na2,b2' ])));
        });

        describe('if quoteColumns is an object and quoteHeaders is an object it should only quote the specified header and column', () => {
            it('should work with objects', () => formatRows(objectRows, { headers: true, quoteHeaders: { b: true }, quoteColumns: { a: true } })
                .then(written => assert.deepStrictEqual(written, [ 'a,"b"', '\n"a1",b1', '\n"a2",b2' ])));

            it('should work with arrays', () => formatRows(arrayRows, { headers: true, quoteHeaders: { b: true }, quoteColumns: { a: true } })
                .then(written => assert.deepStrictEqual(written, [ 'a,"b"', '\n"a1",b1', '\n"a2",b2' ])));

            it('should work with multi-dimensional arrays', () => formatRows(multiDimensionalRows, { headers: true, quoteHeaders: { b: true }, quoteColumns: { a: true } })
                .then(written => assert.deepStrictEqual(written, [ 'a,"b"', '\n"a1",b1', '\n"a2",b2' ])));
        });

        describe('if quoteHeaders is an array and quoteColumns is an false it should only quote the specified header and not the column', () => {
            it('should work with objects', () => formatRows(objectRows, { headers: true, quoteHeaders: [ false, true ], quoteColumns: false })
                .then(written => assert.deepStrictEqual(written, [ 'a,"b"', '\na1,b1', '\na2,b2' ])));

            it('should work with arrays', () => formatRows(arrayRows, { headers: true, quoteHeaders: [ false, true ], quoteColumns: false })
                .then(written => assert.deepStrictEqual(written, [ 'a,"b"', '\na1,b1', '\na2,b2' ])));

            it('should work with arrays of multi-dimensional arrays', () => formatRows(multiDimensionalRows, { headers: true, quoteHeaders: [ false, true ], quoteColumns: false })
                .then(written => assert.deepStrictEqual(written, [ 'a,"b"', '\na1,b1', '\na2,b2' ])));
        });
    });

    it('should add a final rowDelimiter if includeEndRowDelimiter is true', () => formatRows(objectRows, { headers: true, includeEndRowDelimiter: true })
        .then(written => assert.deepStrictEqual(written, [ 'a,b', '\na1,b1', '\na2,b2', '\n' ])));

    describe('.writeToString', () => {
        it('should write an array of arrays', () => csv.writeToString(arrayRows, { headers: true })
            .then(formatted => assert.strictEqual(formatted, 'a,b\na1,b1\na2,b2')));

        it('should support transforming an array of arrays', () => csv.writeToString(arrayRows, {
            headers: true,
            transform(row: Row): Row {
                return (row as RowArray).map(entry => entry.toUpperCase());
            },
        })
            .then(formatted => assert.strictEqual(formatted, 'A,B\nA1,B1\nA2,B2')));

        it('should write an array of multi-dimensional arrays', () => csv.writeToString(multiDimensionalRows, { headers: true })
            .then(formatted => assert.strictEqual(formatted, 'a,b\na1,b1\na2,b2')));

        it('should support transforming an array of multi-dimensional arrays', () => csv.writeToString(multiDimensionalRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowHashArray).map(col => [ col[0], col[1].toUpperCase() ]);
            },
        }).then(formatted => assert.strictEqual(formatted, 'a,b\nA1,B1\nA2,B2')));


        it('should write an array of objects', () => csv.writeToString(objectRows, {
            headers: true,
            transform(row: RowMap) {
                return {
                    A: row.a,
                    B: row.b,
                };
            },
        }).then(formatted => assert.strictEqual(formatted, 'A,B\na1,b1\na2,b2')));

        describe('header option', () => {
            it('should write an array of objects without headers', () => csv.writeToString(objectRows, { headers: false })
                .then(formatted => assert.strictEqual(formatted, 'a1,b1\na2,b2')));

            it('should write an array of objects with headers', () => csv.writeToString(objectRows, { headers: true })
                .then(formatted => assert.strictEqual(formatted, 'a,b\na1,b1\na2,b2')));

            it('should write an array of arrays without headers', () => {
                const rows = [
                    [ 'a1', 'b1' ],
                    [ 'a2', 'b2' ],
                ];
                return csv.writeToString(rows, { headers: false })
                    .then(formatted => assert.strictEqual(formatted, 'a1,b1\na2,b2'));
            });

            it('should write an array of arrays with headers', () => csv.writeToString(arrayRows, { headers: true })
                .then(parsedCsv => assert.strictEqual(parsedCsv, 'a,b\na1,b1\na2,b2')));

            it('should write an array of multi-dimensional arrays without headers', () => csv.writeToString(multiDimensionalRows, { headers: false })
                .then(parsedCsv => assert.strictEqual(parsedCsv, 'a1,b1\na2,b2')));

            it('should write an array of multi-dimensional arrays with headers', () => csv.writeToString(multiDimensionalRows, { headers: true })
                .then(parsedCsv => assert.strictEqual(parsedCsv, 'a,b\na1,b1\na2,b2')));
        });


        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () => csv.writeToString(objectRows, { headers: true, rowDelimiter: '\r\n' })
                .then(parsedCsv => assert.strictEqual(parsedCsv, 'a,b\r\na1,b1\r\na2,b2')));
            it('should escape values that contain the alternate row delimiter', () => {
                const rows = [
                    { a: 'a\t1', b: 'b1' },
                    { a: 'a\t2', b: 'b2' },
                ];
                return csv.writeToString(rows, { headers: true, rowDelimiter: '\t' })
                    .then(parsedCsv => assert.strictEqual(parsedCsv, 'a,b\t"a\t1",b1\t"a\t2",b2'));
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () => csv.writeToString(objectRows, { headers: true, includeEndRowDelimiter: true })
            .then(parsedCsv => assert.strictEqual(parsedCsv, 'a,b\na1,b1\na2,b2\n')));
    });

    describe('.writeToBuffer', () => {
        it('should write an array of arrays', () => csv.writeToBuffer(arrayRows, { headers: true })
            .then(formatted => assert.deepStrictEqual(formatted, Buffer.from('a,b\na1,b1\na2,b2'))));

        it('should support transforming an array of arrays', () => csv.writeToBuffer(arrayRows, {
            headers: true,
            transform(row: Row): Row {
                return (row as RowArray).map(entry => entry.toUpperCase());
            },
        })
            .then(formatted => assert.deepStrictEqual(formatted, Buffer.from('A,B\nA1,B1\nA2,B2'))));

        it('should write an array of multi-dimensional arrays', () => csv.writeToBuffer(multiDimensionalRows, { headers: true })
            .then(formatted => assert.deepStrictEqual(formatted, Buffer.from('a,b\na1,b1\na2,b2'))));

        it('should support transforming an array of multi-dimensional arrays', () => csv.writeToBuffer(multiDimensionalRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowHashArray).map(col => [ col[0], col[1].toUpperCase() ]);
            },
        }).then(formatted => assert.deepStrictEqual(formatted, Buffer.from('a,b\nA1,B1\nA2,B2'))));


        it('should write an array of objects', () => csv.writeToBuffer(objectRows, {
            headers: true,
            transform(row: RowMap): Row {
                return {
                    A: row.a,
                    B: row.b,
                };
            },
        }).then(formatted => assert.deepStrictEqual(formatted, Buffer.from('A,B\na1,b1\na2,b2'))));

        describe('header option', () => {
            it('should write an array of objects without headers', () => csv.writeToBuffer(objectRows, { headers: false })
                .then(formatted => assert.deepStrictEqual(formatted, Buffer.from('a1,b1\na2,b2'))));

            it('should write an array of objects with headers', () => csv.writeToBuffer(objectRows, { headers: true })
                .then(formatted => assert.deepStrictEqual(formatted, Buffer.from('a,b\na1,b1\na2,b2'))));

            it('should write an array of arrays without headers', () => {
                const rows = [
                    [ 'a1', 'b1' ],
                    [ 'a2', 'b2' ],
                ];
                return csv.writeToBuffer(rows, { headers: false })
                    .then(formatted => assert.deepStrictEqual(formatted, Buffer.from('a1,b1\na2,b2')));
            });

            it('should write an array of arrays with headers', () => csv.writeToBuffer(arrayRows, { headers: true })
                .then(parsedCsv => assert.deepStrictEqual(parsedCsv, Buffer.from('a,b\na1,b1\na2,b2'))));

            it('should write an array of multi-dimensional arrays without headers', () => csv.writeToBuffer(multiDimensionalRows, { headers: false })
                .then(parsedCsv => assert.deepStrictEqual(parsedCsv, Buffer.from('a1,b1\na2,b2'))));

            it('should write an array of multi-dimensional arrays with headers', () => csv.writeToBuffer(multiDimensionalRows, { headers: true })
                .then(parsedCsv => assert.deepStrictEqual(parsedCsv, Buffer.from('a,b\na1,b1\na2,b2'))));
        });


        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () => csv.writeToBuffer(objectRows, { headers: true, rowDelimiter: '\r\n' })
                .then(parsedCsv => assert.deepStrictEqual(parsedCsv, Buffer.from('a,b\r\na1,b1\r\na2,b2'))));
            it('should escape values that contain the alternate row delimiter', () => {
                const rows = [
                    { a: 'a\t1', b: 'b1' },
                    { a: 'a\t2', b: 'b2' },
                ];
                return csv.writeToBuffer(rows, { headers: true, rowDelimiter: '\t' })
                    .then(parsedCsv => assert.deepStrictEqual(parsedCsv, Buffer.from('a,b\t"a\t1",b1\t"a\t2",b2')));
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () => csv.writeToBuffer(objectRows, { headers: true, includeEndRowDelimiter: true })
            .then(parsedCsv => assert.deepStrictEqual(parsedCsv, Buffer.from('a,b\na1,b1\na2,b2\n'))));
    });

    describe('.write', () => {
        const writeToRecordingStream = (rows: Row[], options = {}) => new Promise((res, rej) => {
            const rs = new RecordingStream();
            csv
                .write(rows, options)
                .on('error', rej)
                .pipe(rs)
                .on('finish', () => {
                    res(rs.data);
                });
        });

        it('should write an array of arrays', () => writeToRecordingStream(arrayRows, { headers: true })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\na1,b1', '\na2,b2' ])));

        it('should support transforming an array of arrays', () => writeToRecordingStream(arrayRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowArray).map(entry => entry.toUpperCase());
            },
        })
            .then(data => assert.deepStrictEqual(data, [ 'A,B', '\nA1,B1', '\nA2,B2' ])));

        it('should write an array of multi-dimensional arrays', () => writeToRecordingStream(multiDimensionalRows, { headers: true })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\na1,b1', '\na2,b2' ])));

        it('should support transforming an array of multi-dimensional arrays', () => writeToRecordingStream(multiDimensionalRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowHashArray).map(col => [ col[0], col[1].toUpperCase() ]);
            },
        })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\nA1,B1', '\nA2,B2' ])));

        it('should write an array of objects', () => writeToRecordingStream(objectRows, { headers: true })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\na1,b1', '\na2,b2' ])));

        it('should support transforming an array of objects', () => writeToRecordingStream(objectRows, {
            headers: true,
            transform(row: RowMap) {
                return {
                    A: row.a,
                    B: row.b,
                };
            },
        })
            .then(data => assert.deepStrictEqual(data, [ 'A,B', '\na1,b1', '\na2,b2' ])));

        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () => writeToRecordingStream(objectRows, { headers: true, rowDelimiter: '\r\n' })
                .then(data => assert.deepStrictEqual(data, [ 'a,b', '\r\na1,b1', '\r\na2,b2' ])));

            it('should escape values that contain the alternate row delimiter', () => {
                const rows = [
                    { a: 'a\n1', b: 'b1' },
                    { a: 'a\n2', b: 'b2' },
                ];
                return writeToRecordingStream(rows, { headers: true, rowDelimiter: '\n' })
                    .then(data => assert.deepStrictEqual(data, [ 'a,b', '\n"a\n1",b1', '\n"a\n2",b2' ]));
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () => writeToRecordingStream(objectRows, { headers: true, includeEndRowDelimiter: true })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\na1,b1', '\na2,b2', '\n' ])));
    });

    describe('.writeToPath', () => {
        const writeToPath = (rows: Row[], options = {}) => new Promise((res, rej) => {
            const csvPath = path.resolve(__dirname, 'assets/test_output.csv');
            csv
                .writeToPath(csvPath, rows, options)
                .on('error', rej)
                .on('finish', () => {
                    const content = fs.readFileSync(csvPath);
                    fs.unlinkSync(csvPath);
                    res(content);
                });
        });

        it('should write an array of arrays', () => writeToPath(arrayRows, { headers: true })
            .then(content => assert.deepStrictEqual(content, Buffer.from('a,b\na1,b1\na2,b2'))));

        it('should write an array of objects', () => writeToPath(objectRows, { headers: true })
            .then(content => assert.deepStrictEqual(content, Buffer.from('a,b\na1,b1\na2,b2'))));

        it('should write an array of multi-dimensional arrays', () => writeToPath(multiDimensionalRows, { headers: true })
            .then(content => assert.deepStrictEqual(content, Buffer.from('a,b\na1,b1\na2,b2'))));

        it('should support transforming an array of arrays', () => writeToPath(arrayRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowArray).map(entry => entry.toUpperCase());
            },
        })
            .then(content => assert.deepStrictEqual(content, Buffer.from('A,B\nA1,B1\nA2,B2'))));

        it('should transforming an array of objects', () => writeToPath(objectRows, {
            headers: true,
            transform(row: RowMap) {
                return {
                    A: row.a,
                    B: row.b,
                };
            },
        })
            .then(content => assert.deepStrictEqual(content, Buffer.from('A,B\na1,b1\na2,b2'))));


        it('should transforming an array of multi-dimensional array', () => writeToPath(multiDimensionalRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowHashArray).map(col => [ col[0], col[1].toUpperCase() ]);
            },
        })
            .then(content => assert.deepStrictEqual(content, Buffer.from('a,b\nA1,B1\nA2,B2'))));

        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () => writeToPath(objectRows, { headers: true, rowDelimiter: '\r\n' })
                .then(content => assert.deepStrictEqual(content, Buffer.from('a,b\r\na1,b1\r\na2,b2'))));

            it('should escape values that contain the alternate row delimiter', () => {
                const rows = [
                    { a: 'a\r\n1', b: 'b1' },
                    { a: 'a\r\n2', b: 'b2' },
                ];
                return writeToPath(rows, { headers: true, rowDelimiter: '\r\n' })
                    .then(content => assert.deepStrictEqual(content, Buffer.from('a,b\r\n"a\r\n1",b1\r\n"a\r\n2",b2')));
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () => writeToPath(objectRows, { headers: true, includeEndRowDelimiter: true })
            .then(content => assert.deepStrictEqual(content, Buffer.from('a,b\na1,b1\na2,b2\n'))));
    });

    describe('.write', () => {
        const writeToRecordingStream = (rows: Row[], options = {}) => new Promise((res, rej) => {
            const rs = new RecordingStream();
            csv
                .write(rows, options)
                .on('error', rej)
                .pipe(rs)
                .on('finish', () => {
                    res(rs.data);
                });
        });

        it('should write an array of arrays', () => writeToRecordingStream(arrayRows, { headers: true })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\na1,b1', '\na2,b2' ])));

        it('should support transforming an array of arrays', () => writeToRecordingStream(arrayRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowArray).map(entry => entry.toUpperCase());
            },
        })
            .then(data => assert.deepStrictEqual(data, [ 'A,B', '\nA1,B1', '\nA2,B2' ])));

        it('should write an array of multi-dimensional arrays', () => writeToRecordingStream(multiDimensionalRows, { headers: true })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\na1,b1', '\na2,b2' ])));

        it('should support transforming an array of multi-dimensional arrays', () => writeToRecordingStream(multiDimensionalRows, {
            headers: true,
            transform(row: Row) {
                return (row as RowHashArray).map(col => [ col[0], col[1].toUpperCase() ]);
            },
        })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\nA1,B1', '\nA2,B2' ])));

        it('should write an array of objects', () => writeToRecordingStream(objectRows, { headers: true })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\na1,b1', '\na2,b2' ])));

        it('should support transforming an array of objects', () => writeToRecordingStream(objectRows, {
            headers: true,
            transform(row: RowMap) {
                return {
                    A: row.a,
                    B: row.b,
                };
            },
        })
            .then(data => assert.deepStrictEqual(data, [ 'A,B', '\na1,b1', '\na2,b2' ])));

        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () => writeToRecordingStream(objectRows, { headers: true, rowDelimiter: '\r\n' })
                .then(data => assert.deepStrictEqual(data, [ 'a,b', '\r\na1,b1', '\r\na2,b2' ])));

            it('should escape values that contain the alternate row delimiter', () => {
                const rows = [
                    { a: 'a\n1', b: 'b1' },
                    { a: 'a\n2', b: 'b2' },
                ];
                return writeToRecordingStream(rows, { headers: true, rowDelimiter: '\n' })
                    .then(data => assert.deepStrictEqual(data, [ 'a,b', '\n"a\n1",b1', '\n"a\n2",b2' ]));
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () => writeToRecordingStream(objectRows, { headers: true, includeEndRowDelimiter: true })
            .then(data => assert.deepStrictEqual(data, [ 'a,b', '\na1,b1', '\na2,b2', '\n' ])));
    });

    describe('.writeToStream', () => {
        const writeToStream = (rows: Row[], options: FormatterOptionsArgs = {}) => new Promise((res, rej) => {
            const rs = new RecordingStream();
            csv.writeToStream(rs, rows, options);
            rs
                .on('error', rej)
                .on('finish', () => {
                    res(rs.data);
                });
        });

        it('should write an array of arrays', () => writeToStream(arrayRows, { headers: true })
            .then(content => assert.deepStrictEqual(content, [ 'a,b', '\na1,b1', '\na2,b2' ])));

        it('should write an array of objects', () => writeToStream(objectRows, { headers: true })
            .then(content => assert.deepStrictEqual(content, [ 'a,b', '\na1,b1', '\na2,b2' ])));

        it('should write an array of multi-dimensional arrays', () => writeToStream(multiDimensionalRows, { headers: true })
            .then(content => assert.deepStrictEqual(content, [ 'a,b', '\na1,b1', '\na2,b2' ])));

        it('should support transforming an array of arrays', () => writeToStream(arrayRows, {
            headers: true,
            transform(row: Row): Row {
                return (row as RowArray).map(entry => entry.toUpperCase());
            },
        })
            .then(content => assert.deepStrictEqual(content, [ 'A,B', '\nA1,B1', '\nA2,B2' ])));

        it('should transforming an array of objects', () => writeToStream(objectRows, {
            headers: true,
            transform(row: RowMap): Row {
                return {
                    A: row.a,
                    B: row.b,
                };
            },
        })
            .then(content => assert.deepStrictEqual(content, [ 'A,B', '\na1,b1', '\na2,b2' ])));


        it('should transforming an array of multi-dimensional array', () => writeToStream(multiDimensionalRows, {
            headers: true,
            transform(row: Row): Row {
                return (row as RowHashArray).map(col => [ col[0], col[1].toUpperCase() ]);
            },
        })
            .then(content => assert.deepStrictEqual(content, [ 'a,b', '\nA1,B1', '\nA2,B2' ])));

        describe('rowDelimiter option', () => {
            it('should support specifying an alternate row delimiter', () => writeToStream(objectRows, { headers: true, rowDelimiter: '\r\n' })
                .then(content => assert.deepStrictEqual(content, [ 'a,b', '\r\na1,b1', '\r\na2,b2' ])));

            it('should escape values that contain the alternate row delimiter', () => {
                const rows = [
                    { a: 'a\r\n1', b: 'b1' },
                    { a: 'a\r\n2', b: 'b2' },
                ];
                return writeToStream(rows, { headers: true, rowDelimiter: '\r\n' })
                    .then(content => assert.deepStrictEqual(content, [ 'a,b', '\r\n"a\r\n1",b1', '\r\n"a\r\n2",b2' ]));
            });
        });

        it('should add a final rowDelimiter if includeEndRowDelimiter is true', () => writeToStream(objectRows, { headers: true, includeEndRowDelimiter: true })
            .then(content => assert.deepStrictEqual(content, [ 'a,b', '\na1,b1', '\na2,b2', '\n' ])));
    });
});
