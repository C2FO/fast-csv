import { ParserOptionsArgs, RowArray, RowValidationResult } from '../../src';
import { HeaderTransformer } from '../../src/transforms';
import { ParserOptions } from '../../src/ParserOptions';

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
        it('should return a valid row', async () => {
            const row = ['a', 'b'];
            const transformer = createHeaderTransformer({ headers: false });
            await expect(transform(row, transformer)).resolves.toEqual({ row, isValid: true });
        });

        it('should return a null row that is still valid if headers is true', async () => {
            const row = ['a', 'b'];
            const transformer = createHeaderTransformer({ headers: true });
            await expect(transform(row, transformer)).resolves.toEqual({ row: null, isValid: true });
        });

        it('should return a row with mapped headers if headers is an array', async () => {
            const row = ['a', 'b'];
            const transformer = createHeaderTransformer({ headers: ['header1', 'header2'] });
            await expect(transform(row, transformer)).resolves.toEqual({
                row: { header1: 'a', header2: 'b' },
                isValid: true,
            });
        });

        it('should skip columns with an undefined header', async () => {
            const row = ['a', 'b', 'c'];
            const transformer = createHeaderTransformer({ headers: ['header1', undefined, 'header2'] });
            await expect(transform(row, transformer)).resolves.toEqual({
                row: { header1: 'a', header2: 'c' },
                isValid: true,
            });
        });

        it('should skip the first row if renameHeaders is true and headers is an array', async () => {
            const row1 = ['origHeader1', 'origHeader2'];
            const row2 = ['a', 'b'];
            const transformer = createHeaderTransformer({ headers: ['header1', 'header2'], renameHeaders: true });
            await expect(transform(row1, transformer)).resolves.toEqual({ row: null, isValid: true });
            await expect(transform(row2, transformer)).resolves.toEqual({
                row: { header1: 'a', header2: 'b' },
                isValid: true,
            });
        });

        it('should skip the first row if headers is function and properly map the headers to the row', async () => {
            const row1 = ['origHeader1', 'origHeader2'];
            const row2 = ['a', 'b'];
            const transformer = createHeaderTransformer({
                headers: headers => headers.map(h => h?.toUpperCase()),
            });
            await expect(transform(row1, transformer)).resolves.toEqual({ row: null, isValid: true });
            await expect(transform(row2, transformer)).resolves.toEqual({
                row: { ORIGHEADER1: 'a', ORIGHEADER2: 'b' },
                isValid: true,
            });
        });

        it('should throw an error if headers is true and the first row is not unique', async () => {
            const row1 = ['origHeader1', 'origHeader1', 'origHeader2'];
            const transformer = createHeaderTransformer({ headers: true });
            await expect(transform(row1, transformer)).rejects.toThrowError('Duplicate headers found ["origHeader1"]');
        });

        it('should throw an error if headers is an array and is not unique', () => {
            const headers = ['origHeader1', 'origHeader1', 'origHeader2'];
            expect(() => createHeaderTransformer({ headers })).toThrowError('Duplicate headers found ["origHeader1"]');
        });

        it('should throw an error if headers is a transform and returns non-unique values', async () => {
            const row = ['h1', 'h2', 'h3'];
            const transformer = createHeaderTransformer({ headers: () => ['h1', 'h1', 'h3'] });
            await expect(transform(row, transformer)).rejects.toThrowError('Duplicate headers found ["h1"]');
        });

        it('should throw an error if headers is not defined and renameHeaders is true', async () => {
            const row1 = ['origHeader1', 'origHeader2'];
            const transformer = createHeaderTransformer({ renameHeaders: true });
            await expect(transform(row1, transformer)).rejects.toThrowError(
                'Error renaming headers: new headers must be provided in an array',
            );
        });

        it('should throw an error if the row length is > than the headers length as strictColumnHandling is not defined', async () => {
            const row = ['a', 'b', 'c'];
            const transformer = createHeaderTransformer({ headers: ['header1', 'header2'] });
            await expect(transform(row, transformer)).rejects.toThrowError(
                'Unexpected Error: column header mismatch expected: 2 columns got: 3',
            );
        });

        it('should throw an error if the row length is > than the headers length as strictColumnHandling is false', async () => {
            const row = ['a', 'b', 'c'];
            const transformer = createHeaderTransformer({
                headers: ['header1', 'header2'],
                strictColumnHandling: false,
            });
            await expect(transform(row, transformer)).rejects.toThrowError(
                'Unexpected Error: column header mismatch expected: 2 columns got: 3',
            );
        });

        it('should mark the row as invalid if the row length is > than the headers length as strictColumnHandling is true', async () => {
            const row = ['a', 'b', 'c'];
            const transformer = createHeaderTransformer({
                headers: ['header1', 'header2'],
                strictColumnHandling: true,
            });
            await expect(transform(row, transformer)).resolves.toEqual({
                row,
                isValid: false,
                reason: 'Column header mismatch expected: 2 columns got: 3',
            });
        });

        it('should return a mapped row if row length is < than the headers length as strictColumnHandling is not defined', async () => {
            const row = ['a'];
            const transformer = createHeaderTransformer({ headers: ['header1', 'header2'] });
            await expect(transform(row, transformer)).resolves.toEqual({
                row: { header1: 'a', header2: '' },
                isValid: true,
            });
        });

        it('should return a mapped row if row length is < than the headers length as strictColumnHandling is not false', async () => {
            const row = ['a'];
            const transformer = createHeaderTransformer({
                headers: ['header1', 'header2'],
                strictColumnHandling: false,
            });
            await expect(transform(row, transformer)).resolves.toEqual({
                row: { header1: 'a', header2: '' },
                isValid: true,
            });
        });

        it('should mark the row as invalid if the row length is < than the headers length as strictColumnHandling is true', async () => {
            const row = ['a'];
            const transformer = createHeaderTransformer({
                headers: ['header1', 'header2'],
                strictColumnHandling: true,
            });
            await expect(transform(row, transformer)).resolves.toEqual({
                row,
                isValid: false,
                reason: 'Column header mismatch expected: 2 columns got: 1',
            });
        });
    });
});
