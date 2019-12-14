import * as assert from 'assert';
import { FormatterOptions, FormatterOptionsArgs } from '../../src/formatter';

describe('FormatterOptions', () => {
    const createOptions = (opts: FormatterOptionsArgs = {}) => new FormatterOptions(opts);

    describe('#objectMode', () => {
        it('should have default objectMode', () => {
            assert.strictEqual(createOptions().objectMode, true);
        });

        it('should accept a boolean objectMode', () => {
            assert.strictEqual(createOptions({ objectMode: true }).objectMode, true);
            assert.strictEqual(createOptions({ objectMode: false }).objectMode, false);
        });
    });

    describe('#delimiter', () => {
        it('should have default delimiter', () => {
            assert.strictEqual(createOptions().delimiter, ',');
        });

        it('should accept a custom delimiter', () => {
            assert.strictEqual(createOptions({ delimiter: '\t' }).delimiter, '\t');
        });
    });

    describe('#rowDelimiter', () => {
        it('should have default rowDelimiter', () => {
            assert.strictEqual(createOptions().rowDelimiter, '\n');
        });

        it('should accept a custom rowDelimiter', () => {
            assert.strictEqual(createOptions({ rowDelimiter: '\r\n' }).rowDelimiter, '\r\n');
        });
    });

    describe('#quote', () => {
        it('should set a default quote value', () => {
            assert.strictEqual(createOptions().quote, '"');
        });

        it('should accept an alternate quote', () => {
            assert.strictEqual(createOptions({ quote: '$' }).quote, '$');
        });

        it('if the set to true the default quote should be used', () => {
            assert.strictEqual(createOptions({ quote: true }).quote, '"');
        });

        it('if the set to false the quote should be empty', () => {
            assert.strictEqual(createOptions({ quote: false }).quote, '');
        });
    });

    describe('#escape', () => {
        it('should set the escape character to the quote value if not specified', () => {
            assert.strictEqual(createOptions().escape, '"');
        });

        it('should set the escape character to the quote value if not specified', () => {
            assert.strictEqual(createOptions({ quote: '$' }).escape, '$');
        });

        it('should accept an alternate escape', () => {
            assert.strictEqual(createOptions({ escape: '%' }).escape, '%');
        });
    });

    describe('#quoteColumns', () => {
        it('should set the quoteColumns to false', () => {
            assert.strictEqual(createOptions().quoteColumns, false);
        });

        it('should set the quoteColumns to true if specified', () => {
            assert.strictEqual(createOptions({ quoteColumns: true }).quoteColumns, true);
        });

        it('should set the quoteColumns to an array if specified', () => {
            assert.deepStrictEqual(createOptions({ quoteColumns: [true, true, true] }).quoteColumns, [
                true,
                true,
                true,
            ]);
        });

        it('should set the quoteColumns to an object if specified', () => {
            assert.deepStrictEqual(createOptions({ quoteColumns: { a: true, b: false } }).quoteColumns, {
                a: true,
                b: false,
            });
        });

        it('should set quoteHeaders to quoteColumns if quoteHeaders is not specified and quoteColumns is', () => {
            assert.deepStrictEqual(createOptions({ quoteColumns: true }).quoteHeaders, true);
            assert.deepStrictEqual(createOptions({ quoteColumns: [true, true, true] }).quoteHeaders, [
                true,
                true,
                true,
            ]);
            assert.deepStrictEqual(createOptions({ quoteColumns: { a: true, b: false } }).quoteHeaders, {
                a: true,
                b: false,
            });
        });
    });

    describe('#quoteHeaders', () => {
        it('should set the quoteHeaders to false', () => {
            assert.strictEqual(createOptions().quoteHeaders, false);
        });

        it('should set the quoteHeaders to true if specified', () => {
            assert.strictEqual(createOptions({ quoteHeaders: true }).quoteHeaders, true);
        });

        it('should set the quoteHeaders to an array if specified', () => {
            assert.deepStrictEqual(createOptions({ quoteHeaders: [true, true, true] }).quoteHeaders, [
                true,
                true,
                true,
            ]);
        });

        it('should set the quoteHeaders to an object if specified', () => {
            assert.deepStrictEqual(createOptions({ quoteHeaders: { a: true, b: false } }).quoteHeaders, {
                a: true,
                b: false,
            });
        });
    });

    describe('#headers', () => {
        it('should have default headers', () => {
            assert.strictEqual(createOptions().headers, null);
        });

        it('should accept an array of headers', () => {
            assert.deepStrictEqual(createOptions({ headers: ['1', '2', '3'] }).headers, ['1', '2', '3']);
        });

        it('should accept an boolean and set headers to null', () => {
            assert.deepStrictEqual(createOptions({ headers: true }).headers, null);
        });

        it('should set hasHeaders provided to true if headers is provided as an array', () => {
            assert.deepStrictEqual(createOptions({ headers: ['1', '2', '3'] }).shouldWriteHeaders, true);
        });

        it('should set hasHeaders provided to false if headers is provided as a boolean', () => {
            assert.deepStrictEqual(createOptions({ headers: true }).shouldWriteHeaders, true);
        });
    });

    describe('#includeEndRowDelimiter', () => {
        it('should set includeEndRowDelimiter to false by default', () => {
            assert.strictEqual(createOptions().includeEndRowDelimiter, false);
        });

        it('should set to true if the includeEndRowDelimiter is specified', () => {
            assert.strictEqual(createOptions({ includeEndRowDelimiter: true }).includeEndRowDelimiter, true);
        });
    });

    describe('#writeBOM', () => {
        it('should set includeEndRowDelimiter to false by default', () => {
            assert.strictEqual(createOptions().writeBOM, false);
        });

        it('should set to true if the writeBOM is specified', () => {
            assert.strictEqual(createOptions({ writeBOM: true }).writeBOM, true);
        });
    });
});
