import * as assert from 'assert';
import {
    FormatterRow as Row,
    FormatterRowArray as RowArray,
    FormatterRowHashArray as RowHashArray,
    FormatterRowMap as RowMap,
    FormatterRowTransformCallback as RowTransformCallback,
} from '../../../src';
import { RowFormatter, FormatterOptions } from '../../../src/formatter';

describe('RowFormatter', () => {
    const createFormatter = (formatterOptions = {}): RowFormatter =>
        new RowFormatter(new FormatterOptions(formatterOptions));

    const formatRow = (row: Row, formatter: RowFormatter): Promise<Row> =>
        new Promise((res, rej): void => {
            formatter.format(row, (err, formatted): void => {
                if (err) {
                    return rej(err);
                }
                return res(formatted);
            });
        });

    describe('#format', () => {
        describe('with array', () => {
            const headerRow = ['a', 'b'];
            const columnsRow = ['a1', 'b1'];

            const syncTransform = (row: RowArray): Row => row.map(col => col.toUpperCase());
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const syncError = (row: RowArray): Row => {
                throw new Error('Expected Error');
            };
            const asyncTransform = (row: RowArray, cb: RowTransformCallback): void => {
                setImmediate(() => cb(null, syncTransform(row)));
            };
            const asyncErrorTransform = (row: RowArray, cb: RowTransformCallback): void => {
                setImmediate(() => cb(new Error('Expected Error')));
            };

            it('should format an array', () => {
                const formatter = createFormatter({ headers: true });
                return formatRow(headerRow, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b']));
            });

            it('should should append a new line if a second row is written', () => {
                const formatter = createFormatter({ headers: true });
                return formatRow(headerRow, formatter)
                    .then(rows => assert.deepStrictEqual(rows, ['a,b']))
                    .then(() => formatRow(columnsRow, formatter))
                    .then(rows => assert.deepStrictEqual(rows, ['\na1,b1']));
            });

            it('should support a sync transform', () => {
                const formatter = createFormatter({ headers: true, transform: syncTransform });
                return formatRow(headerRow, formatter).then(rows => assert.deepStrictEqual(rows, ['A,B']));
            });

            it('should catch a sync transform thrown error', () => {
                const formatter = createFormatter({ headers: true, transform: syncError });
                return formatRow(headerRow, formatter).catch(err => assert.strictEqual(err.message, 'Expected Error'));
            });

            it('should support an async transform', () => {
                const formatter = createFormatter({ headers: true, transform: asyncTransform });
                return formatRow(headerRow, formatter).then(rows => assert.deepStrictEqual(rows, ['A,B']));
            });

            it('should support an async transform with error', () => {
                const formatter = createFormatter({ headers: true, transform: asyncErrorTransform });
                return formatRow(headerRow, formatter).catch(err => assert.strictEqual(err.message, 'Expected Error'));
            });

            describe('headers option', () => {
                describe('with headers=false', () => {
                    it('should still write the first row', () => {
                        const formatter = createFormatter({ headers: false });
                        return formatRow(headerRow, formatter).then(rows =>
                            assert.deepStrictEqual(rows, [headerRow.join(',')]),
                        );
                    });
                });

                describe('with headers=true', () => {
                    it('should only write the first row', () => {
                        const formatter = createFormatter({ headers: true });
                        return formatRow(headerRow, formatter).then(rows =>
                            assert.deepStrictEqual(rows, [headerRow.join(',')]),
                        );
                    });
                });

                describe('with headers provided', () => {
                    it('should only write the first row', () => {
                        const formatter = createFormatter({ headers: headerRow });
                        return formatRow(columnsRow, formatter).then(rows =>
                            assert.deepStrictEqual(rows, [headerRow.join(','), `\n${columnsRow.join(',')}`]),
                        );
                    });

                    it('should append an additional column for new fields', () => {
                        const formatter = createFormatter({ headers: ['A', 'B', 'no_field'] });
                        return formatRow(columnsRow, formatter).then(rows =>
                            assert.deepStrictEqual(rows, ['A,B,no_field', '\na1,b1,']),
                        );
                    });

                    it('should exclude columns that do not have a header', () => {
                        const formatter = createFormatter({ headers: ['A'] });
                        return formatRow(columnsRow, formatter).then(rows =>
                            assert.deepStrictEqual(rows, ['A', '\na1']),
                        );
                    });
                });
            });

            describe('rowDelimiter option', () => {
                it('should support specifying an alternate row delimiter', () => {
                    const formatter = createFormatter({ headers: true, rowDelimiter: '\r\n' });
                    return formatRow(headerRow, formatter)
                        .then(rows => assert.deepStrictEqual(rows, ['a,b']))
                        .then(() => formatRow(columnsRow, formatter))
                        .then(rows => assert.deepStrictEqual(rows, ['\r\na1,b1']));
                });
            });
        });

        describe('with multi-dimensional arrays', () => {
            const row: Row = [
                ['a', 'a1'],
                ['b', 'b1'],
            ];

            const syncTransform = (rowToTransform: RowHashArray): Row =>
                rowToTransform.map(([header, col]) => [header, col.toUpperCase()]);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const syncError = (rowToTransform: RowHashArray): Row => {
                throw new Error('Expected Error');
            };
            const asyncTransform = (rowToTransform: RowHashArray, cb: RowTransformCallback) => {
                setImmediate(() => cb(null, syncTransform(rowToTransform)));
            };
            const asyncErrorTransform = (rowToTransform: RowHashArray, cb: RowTransformCallback) =>
                setImmediate(() => cb(new Error('Expected Error')));

            it('should format a multi-dimensional array with headers true', () => {
                const formatter = createFormatter({ headers: true });
                return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\na1,b1']));
            });

            it('should not include headers if headers is false', () => {
                const formatter = createFormatter({ headers: false });
                return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a1,b1']));
            });

            it('should support a sync transform', () => {
                const formatter = createFormatter({ headers: true, transform: syncTransform });
                return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\nA1,B1']));
            });

            it('should catch a sync transform thrown error', () => {
                const formatter = createFormatter({ headers: true, transform: syncError });
                return formatRow(row, formatter).catch(err => assert.strictEqual(err.message, 'Expected Error'));
            });

            it('should support an async transform', () => {
                const formatter = createFormatter({ headers: true, transform: asyncTransform });
                return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\nA1,B1']));
            });

            it('should support an async transform with error', () => {
                const formatter = createFormatter({ headers: true, transform: asyncErrorTransform });
                return formatRow(row, formatter).catch(err => assert.strictEqual(err.message, 'Expected Error'));
            });

            describe('headers option', () => {
                describe('with headers=false', () => {
                    it('should still write the first row', () => {
                        const formatter = createFormatter({ headers: false });
                        return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a1,b1']));
                    });
                });

                describe('with headers=true', () => {
                    it('should only write the first row', () => {
                        const formatter = createFormatter({ headers: true });
                        return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\na1,b1']));
                    });
                });

                describe('with headers provided', () => {
                    it('should write the headers and first row', () => {
                        const formatter = createFormatter({ headers: ['A', 'B'] });
                        return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['A,B', '\na1,b1']));
                    });

                    it('should append an additional column for new fields', () => {
                        const formatter = createFormatter({ headers: ['A', 'B', 'no_field'] });
                        return formatRow(row, formatter).then(rows =>
                            assert.deepStrictEqual(rows, ['A,B,no_field', '\na1,b1,']),
                        );
                    });

                    it('should exclude columns that do not have a header', () => {
                        const formatter = createFormatter({ headers: ['A'] });
                        return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['A', '\na1']));
                    });
                });
            });

            describe('rowDelimiter option', () => {
                it('should support specifying an alternate row delimiter', () => {
                    const formatter = createFormatter({ headers: true, rowDelimiter: '\r\n' });
                    return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\r\na1,b1']));
                });
            });
        });

        describe('with objects', () => {
            const row = { a: 'a1', b: 'b1' };

            const syncTransform = (rowToTransform: RowMap): Row => ({
                a: rowToTransform.a.toUpperCase(),
                b: rowToTransform.b.toUpperCase(),
            });
            const syncError = () => {
                throw new Error('Expected Error');
            };
            const asyncTransform = (rowToTransform: RowMap, cb: RowTransformCallback) =>
                setImmediate(() => cb(null, syncTransform(rowToTransform)));
            const asyncErrorTransform = (rowToTransform: RowMap, cb: RowTransformCallback) =>
                setImmediate(() => cb(new Error('Expected Error')));

            it('should return a headers row with when headers true', () => {
                const formatter = createFormatter({ headers: true });
                return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\na1,b1']));
            });

            it('should not include headers if headers is false', () => {
                const formatter = createFormatter({ headers: false });
                return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a1,b1']));
            });

            it('should support a sync transform', () => {
                const formatter = createFormatter({ headers: true, transform: syncTransform });
                return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\nA1,B1']));
            });

            it('should catch a sync transform thrown error', () => {
                const formatter = createFormatter({ headers: true, transform: syncError });
                return formatRow(row, formatter).catch(err => assert.strictEqual(err.message, 'Expected Error'));
            });

            it('should support an async transform', () => {
                const formatter = createFormatter({ headers: true, transform: asyncTransform });
                return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\nA1,B1']));
            });

            it('should support an async transform with error', () => {
                const formatter = createFormatter({ headers: true, transform: asyncErrorTransform });
                return formatRow(row, formatter).catch(err => assert.strictEqual(err.message, 'Expected Error'));
            });

            describe('headers option', () => {
                describe('with headers=false', () => {
                    it('should still write the first row', () => {
                        const formatter = createFormatter({ headers: false });
                        return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a1,b1']));
                    });
                });

                describe('with headers=true', () => {
                    it('should only write the first row', () => {
                        const formatter = createFormatter({ headers: true });
                        return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\na1,b1']));
                    });
                });

                describe('with headers provided', () => {
                    it('should the new headers and the row', () => {
                        const formatter = createFormatter({ headers: ['a', 'b'] });
                        return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\na1,b1']));
                    });

                    it('should respect the order of the columns', () => {
                        const formatter = createFormatter({ headers: ['b', 'a'] });
                        return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['b,a', '\nb1,a1']));
                    });

                    it('should append an additional column for new fields', () => {
                        const formatter = createFormatter({ headers: ['a', 'b', 'no_field'] });
                        return formatRow(row, formatter).then(rows =>
                            assert.deepStrictEqual(rows, ['a,b,no_field', '\na1,b1,']),
                        );
                    });
                });
            });

            describe('rowDelimiter option', () => {
                it('should support specifying an alternate row delimiter', () => {
                    const formatter = createFormatter({ headers: true, rowDelimiter: '\r\n' });
                    return formatRow(row, formatter).then(rows => assert.deepStrictEqual(rows, ['a,b', '\r\na1,b1']));
                });
            });
        });
    });

    describe('#rowTransform', () => {
        it('should throw an error if the transform is set and is not a function', () => {
            const formatter = createFormatter();
            assert.throws(() => {
                // @ts-ignore
                formatter.rowTransform = 'foo';
            }, /TypeError: The transform should be a function/);
        });
    });
});
