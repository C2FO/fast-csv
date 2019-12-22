import { ParserRow as Row, ParserRowArray as RowArray } from '../../../src';
import { RowValidationResult, RowTransformerValidator } from '../../../src/parser';

describe('RowTransformerValidator', () => {
    const createRowTransformerValidator = () => new RowTransformerValidator();

    const transformAndValidate = (row: RowArray, transformer: RowTransformerValidator): Promise<RowValidationResult> =>
        new Promise((res, rej) => {
            transformer.transformAndValidate(row, (err, results) => {
                if (err) {
                    return rej(err);
                }
                if (!results) {
                    return rej(new Error('No error or results found'));
                }
                return res(results);
            });
        });

    describe('#transformAndValidate', () => {
        it('should return a valid row if validator and transform are not defined', async () => {
            const row = ['a', 'b'];
            const transformer = createRowTransformerValidator();
            await expect(transformAndValidate(row, transformer)).resolves.toEqual({ row, isValid: true });
        });

        describe('#rowTransform', () => {
            it('should throw an error if the transform is not a function', () => {
                const transformer = createRowTransformerValidator();
                expect(() => {
                    // @ts-ignore
                    transformer.rowTransform = 'foo';
                }).toThrowError('The transform should be a function');
            });

            it('should transform a row synchronously', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                transformer.rowTransform = (r: Row) => (r as RowArray).map(col => col.toUpperCase());
                await expect(transformAndValidate(row, transformer)).resolves.toEqual({
                    row: ['A', 'B'],
                    isValid: true,
                });
            });

            it('should transform a row synchronously', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                transformer.rowTransform = (r: Row) => (r as RowArray).map(col => col.toUpperCase());
                await expect(transformAndValidate(row, transformer)).resolves.toEqual({
                    row: ['A', 'B'],
                    isValid: true,
                });
            });

            it('should resolve with an error if the transform throws an error', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                transformer.rowTransform = (r: Row) => {
                    throw new Error('Expected error');
                };
                await expect(transformAndValidate(row, transformer)).rejects.toThrowError('Expected error');
            });

            it('should transform a row asynchronously', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                transformer.rowTransform = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(
                            null,
                            (r as RowArray).map(col => col.toUpperCase()),
                        );
                    });
                };
                await expect(transformAndValidate(row, transformer)).resolves.toEqual({
                    row: ['A', 'B'],
                    isValid: true,
                });
            });

            it('should resolve with an error if an error is provided to the callback', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                transformer.rowTransform = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(new Error('Expected error'));
                    });
                };
                await expect(transformAndValidate(row, transformer)).rejects.toThrowError('Expected error');
            });
        });

        describe('#rowValidator', () => {
            it('should throw an error if the validator is not a function', () => {
                const transformer = createRowTransformerValidator();
                expect(() => {
                    // @ts-ignore
                    transformer.rowValidator = 'foo';
                }).toThrowError('The validate should be a function');
            });

            it('should validate a row synchronously', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                transformer.rowValidator = (r: Row) => false;
                await expect(transformAndValidate(row, transformer)).resolves.toEqual({
                    row,
                    isValid: false,
                    reason: undefined,
                });
            });

            it('should validate a row asynchronously', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                transformer.rowValidator = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(null, false);
                    });
                };
                await expect(transformAndValidate(row, transformer)).resolves.toEqual({
                    row,
                    isValid: false,
                    reason: undefined,
                });
            });

            it('should validate a row asynchronously with a reason', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                transformer.rowValidator = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(null, false, 'just because');
                    });
                };
                await expect(transformAndValidate(row, transformer)).resolves.toEqual({
                    row,
                    isValid: false,
                    reason: 'just because',
                });
            });

            it('should resolve with an error if the validate throws an error', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                transformer.rowValidator = (r: Row) => {
                    throw new Error('Expected error');
                };
                await expect(transformAndValidate(row, transformer)).rejects.toThrowError('Expected error');
            });

            it('should resolve with an error if an error is provided to the callback', async () => {
                const row = ['a', 'b'];
                const transformer = createRowTransformerValidator();
                transformer.rowValidator = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(new Error('Expected error'));
                    });
                };
                await expect(transformAndValidate(row, transformer)).rejects.toThrowError('Expected error');
            });
        });
    });
});
