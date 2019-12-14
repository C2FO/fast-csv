import * as assert from 'assert';
import { HeaderTransformer } from '../../../src/parser/transforms';
import { ParserOptions, ParserOptionsArgs, RowArray, RowValidationResult } from '../../../src/parser';

describe('HeaderTransformer', () => {
    const createHeaderTransformer = (opts?: ParserOptionsArgs) => new HeaderTransformer(new ParserOptions(opts));

    const transform = (row: RowArray, transformer: HeaderTransformer): Promise<RowValidationResult> =>
        new Promise((res, rej) => {
            transformer.transform(row, (err, results) => {
                if (err) {
                    return rej(err);
                }
                if (!results) {
                    return rej(new Error('No error or results found'));
                }
                return res(results);
            });
        });

    describe('#transform', () => {
        it('should return a valid row', () => {
            const row = ['a', 'b'];
            const transformer = createHeaderTransformer({ headers: false });
            return transform(row, transformer).then(results => {
                assert.deepStrictEqual(results, { row, isValid: true });
            });
        });

        it('should return a null row that is still valid if headers is true', () => {
            const row = ['a', 'b'];
            const transformer = createHeaderTransformer({ headers: true });
            return transform(row, transformer).then(results => {
                assert.deepStrictEqual(results, { row: null, isValid: true });
            });
        });

        it('should return a row with mapped headers if headers is an array', () => {
            const row = ['a', 'b'];
            const transformer = createHeaderTransformer({ headers: ['header1', 'header2'] });
            return transform(row, transformer).then(results => {
                assert.deepStrictEqual(results, { row: { header1: 'a', header2: 'b' }, isValid: true });
            });
        });

        it('should skip columns with an undefined header', () => {
            const row = ['a', 'b', 'c'];
            const transformer = createHeaderTransformer({ headers: ['header1', undefined, 'header2'] });
            return transform(row, transformer).then(results => {
                assert.deepStrictEqual(results, { row: { header1: 'a', header2: 'c' }, isValid: true });
            });
        });

        it('should skip the first row if renameHeaders is true and headers is an array', () => {
            const row1 = ['origHeader1', 'origHeader2'];
            const row2 = ['a', 'b'];
            const transformer = createHeaderTransformer({ headers: ['header1', 'header2'], renameHeaders: true });
            return transform(row1, transformer)
                .then(results => {
                    assert.deepStrictEqual(results, { row: null, isValid: true });
                    return transform(row2, transformer);
                })
                .then(results => {
                    assert.deepStrictEqual(results, { row: { header1: 'a', header2: 'b' }, isValid: true });
                });
        });

        it('should throw an error if headers is not defined and renameHeaders is true', () => {
            const row1 = ['origHeader1', 'origHeader2'];
            const transformer = createHeaderTransformer({ renameHeaders: true });
            return transform(row1, transformer).then(
                () => assert.fail('should have failed'),
                err =>
                    assert.strictEqual(err.message, 'Error renaming headers: new headers must be provided in an array'),
            );
        });

        it('should throw an error if the row length is > than the headers length as strictColumnHandling is not defined', () => {
            const row = ['a', 'b', 'c'];
            const transformer = createHeaderTransformer({ headers: ['header1', 'header2'] });
            return transform(row, transformer).then(
                () => assert.fail('should have failed'),
                err =>
                    assert.strictEqual(
                        err.message,
                        'Unexpected Error: column header mismatch expected: 2 columns got: 3',
                    ),
            );
        });

        it('should throw an error if the row length is > than the headers length as strictColumnHandling is false', () => {
            const row = ['a', 'b', 'c'];
            const transformer = createHeaderTransformer({
                headers: ['header1', 'header2'],
                strictColumnHandling: false,
            });
            return transform(row, transformer).then(
                () => assert.fail('should have failed'),
                err =>
                    assert.strictEqual(
                        err.message,
                        'Unexpected Error: column header mismatch expected: 2 columns got: 3',
                    ),
            );
        });

        it('should mark the row as invalid if the row length is > than the headers length as strictColumnHandling is true', () => {
            const row = ['a', 'b', 'c'];
            const transformer = createHeaderTransformer({
                headers: ['header1', 'header2'],
                strictColumnHandling: true,
            });
            return transform(row, transformer).then(results => {
                assert.deepStrictEqual(results, {
                    row,
                    isValid: false,
                    reason: 'Column header mismatch expected: 2 columns got: 3',
                });
            });
        });

        it('should return a mapped row if row length is < than the headers length as strictColumnHandling is not defined', () => {
            const row = ['a'];
            const transformer = createHeaderTransformer({ headers: ['header1', 'header2'] });
            return transform(row, transformer).then(results => {
                assert.deepStrictEqual(results, {
                    row: { header1: 'a', header2: '' },
                    isValid: true,
                });
            });
        });

        it('should return a mapped row if row length is < than the headers length as strictColumnHandling is not false', () => {
            const row = ['a'];
            const transformer = createHeaderTransformer({
                headers: ['header1', 'header2'],
                strictColumnHandling: false,
            });
            return transform(row, transformer).then(results => {
                assert.deepStrictEqual(results, {
                    row: { header1: 'a', header2: '' },
                    isValid: true,
                });
            });
        });

        it('should mark the row as invalid if the row length is < than the headers length as strictColumnHandling is true', () => {
            const row = ['a'];
            const transformer = createHeaderTransformer({
                headers: ['header1', 'header2'],
                strictColumnHandling: true,
            });
            return transform(row, transformer).then(results => {
                assert.deepStrictEqual(results, {
                    row,
                    isValid: false,
                    reason: 'Column header mismatch expected: 2 columns got: 1',
                });
            });
        });
    });
});
