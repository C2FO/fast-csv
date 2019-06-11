import * as assert from 'assert';
import { Row, RowArray, RowValidationResult } from '../../../src/parser';
import { RowTransformerValidator } from '../../../src/parser/transforms';


describe('RowTransformerValidator', () => {
    const createRowTransformerValidator = () => new RowTransformerValidator();

    const transformAndValidate = (row: RowArray, transformer: RowTransformerValidator): Promise<RowValidationResult> => new Promise((res, rej) => {
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
        it('should return a valid row if validator and transform are not defined', () => {
            const row = [ 'a', 'b' ];
            const transformer = createRowTransformerValidator();
            return transformAndValidate(row, transformer).then((results) => {
                assert.deepStrictEqual(results, { row, isValid: true });
            });
        });

        describe('#rowTransform', () => {
            it('should throw an error if the transform is not a function', () => {
                const transformer = createRowTransformerValidator();
                assert.throws(() => {
                // @ts-ignore
                    transformer.rowTransform = 'foo';
                }, /TypeError: The transform should be a function/);
            });

            it('should transform a row synchronously', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                transformer.rowTransform = (r: Row) => (r as RowArray).map(col => col.toUpperCase());
                return transformAndValidate(row, transformer).then((results) => {
                    assert.deepStrictEqual(results, { row: [ 'A', 'B' ], isValid: true });
                });
            });

            it('should transform a row synchronously', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                transformer.rowTransform = (r: Row) => (r as RowArray).map(col => col.toUpperCase());
                return transformAndValidate(row, transformer).then((results) => {
                    assert.deepStrictEqual(results, { row: [ 'A', 'B' ], isValid: true });
                });
            });

            it('should resolve with an error if the transform throws an error', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                transformer.rowTransform = (r: Row) => {
                    throw new Error('Expected error');
                };
                return transformAndValidate(row, transformer).then(
                    () => assert.fail('should have failed'),
                    err => assert.strictEqual(err.message, 'Expected error')
                );
            });

            it('should transform a row asynchronously', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                transformer.rowTransform = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(null, (r as RowArray).map(col => col.toUpperCase()));
                    });
                };
                return transformAndValidate(row, transformer).then((results) => {
                    assert.deepStrictEqual(results, { row: [ 'A', 'B' ], isValid: true });
                });
            });

            it('should resolve with an error if an error is provided to the callback', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                transformer.rowTransform = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(new Error('Expected error'));
                    });
                };
                return transformAndValidate(row, transformer).then(
                    () => assert.fail('should have failed'),
                    err => assert.strictEqual(err.message, 'Expected error')
                );
            });
        });

        describe('#rowValidator', () => {
            it('should throw an error if the validator is not a function', () => {
                const transformer = createRowTransformerValidator();
                assert.throws(() => {
                    // @ts-ignore
                    transformer.rowValidator = 'foo';
                }, /TypeError: The validate should be a function/);
            });

            it('should validate a row synchronously', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                transformer.rowValidator = (r: Row) => false;
                return transformAndValidate(row, transformer).then((results) => {
                    assert.deepStrictEqual(results, { row, isValid: false, reason: undefined });
                });
            });

            it('should validate a row asynchronously', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                transformer.rowValidator = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(null, false);
                    });
                };
                return transformAndValidate(row, transformer).then((results) => {
                    assert.deepStrictEqual(results, { row, isValid: false, reason: undefined });
                });
            });

            it('should validate a row asynchronously with a reason', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                transformer.rowValidator = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(null, false, 'just because');
                    });
                };
                return transformAndValidate(row, transformer).then((results) => {
                    assert.deepStrictEqual(results, { row, isValid: false, reason: 'just because' });
                });
            });

            it('should resolve with an error if the validate throws an error', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                transformer.rowValidator = (r: Row) => {
                    throw new Error('Expected error');
                };
                return transformAndValidate(row, transformer).then(
                    () => assert.fail('should have failed'),
                    err => assert.strictEqual(err.message, 'Expected error')
                );
            });

            it('should resolve with an error if an error is provided to the callback', () => {
                const row = [ 'a', 'b' ];
                const transformer = createRowTransformerValidator();
                transformer.rowValidator = (r: Row, cb) => {
                    setImmediate(() => {
                        cb(new Error('Expected error'));
                    });
                };
                return transformAndValidate(row, transformer).then(
                    () => assert.fail('should have failed'),
                    err => assert.strictEqual(err.message, 'Expected error')
                );
            });
        });
    });
});
