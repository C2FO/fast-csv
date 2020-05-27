import { FormatterOptionsArgs, Row } from '../src';
import { FormatterOptions } from '../src/FormatterOptions';

describe('FormatterOptions', () => {
    const createOptions = <I extends Row, O extends Row>(opts: FormatterOptionsArgs<I, O> = {}) =>
        new FormatterOptions(opts);

    describe('#objectMode', () => {
        it('should have default objectMode', () => {
            expect(createOptions().objectMode).toBe(true);
        });

        it('should accept a boolean objectMode', () => {
            expect(createOptions({ objectMode: true }).objectMode).toBe(true);
            expect(createOptions({ objectMode: false }).objectMode).toBe(false);
        });
    });

    describe('#delimiter', () => {
        it('should have default delimiter', () => {
            expect(createOptions().delimiter).toBe(',');
        });

        it('should accept a custom delimiter', () => {
            expect(createOptions({ delimiter: '\t' }).delimiter).toBe('\t');
        });
    });

    describe('#rowDelimiter', () => {
        it('should have default rowDelimiter', () => {
            expect(createOptions().rowDelimiter).toBe('\n');
        });

        it('should accept a custom rowDelimiter', () => {
            expect(createOptions({ rowDelimiter: '\r\n' }).rowDelimiter).toBe('\r\n');
        });
    });

    describe('#quote', () => {
        it('should set a default quote value', () => {
            expect(createOptions().quote).toBe('"');
        });

        it('should accept an alternate quote', () => {
            expect(createOptions({ quote: '$' }).quote).toBe('$');
        });

        it('if the set to true the default quote should be used', () => {
            expect(createOptions({ quote: true }).quote).toBe('"');
        });

        it('if the set to false the quote should be empty', () => {
            expect(createOptions({ quote: false }).quote).toBe('');
        });
    });

    describe('#escape', () => {
        it('should set the escape character to the default quote value if not specified', () => {
            expect(createOptions().escape).toBe('"');
        });

        it('should set the escape character to the quote value if specified', () => {
            expect(createOptions({ quote: '$' }).escape).toBe('$');
        });

        it('should accept an alternate escape', () => {
            expect(createOptions({ escape: '%' }).escape).toBe('%');
        });
    });

    describe('#quoteColumns', () => {
        it('should set the quoteColumns to false', () => {
            expect(createOptions().quoteColumns).toBe(false);
        });

        it('should set the quoteColumns to true if specified', () => {
            expect(createOptions({ quoteColumns: true }).quoteColumns).toBe(true);
        });

        it('should set the quoteColumns to an array if specified', () => {
            expect(createOptions({ quoteColumns: [true, true, true] }).quoteColumns).toEqual([true, true, true]);
        });

        it('should set the quoteColumns to an object if specified', () => {
            expect(createOptions({ quoteColumns: { a: true, b: false } }).quoteColumns).toEqual({
                a: true,
                b: false,
            });
        });

        it('should set quoteHeaders to quoteColumns if quoteHeaders is not specified and quoteColumns is', () => {
            expect(createOptions({ quoteColumns: true }).quoteHeaders).toBe(true);
            expect(createOptions({ quoteColumns: [true, true, true] }).quoteHeaders).toEqual([true, true, true]);
            expect(createOptions({ quoteColumns: { a: true, b: false } }).quoteHeaders).toEqual({
                a: true,
                b: false,
            });
        });
    });

    describe('#quoteHeaders', () => {
        it('should set the quoteHeaders to false', () => {
            expect(createOptions().quoteHeaders).toBe(false);
        });

        it('should set the quoteHeaders to true if specified', () => {
            expect(createOptions({ quoteHeaders: true }).quoteHeaders).toBe(true);
        });

        it('should set the quoteHeaders to an array if specified', () => {
            expect(createOptions({ quoteHeaders: [true, true, true] }).quoteHeaders).toEqual([true, true, true]);
        });

        it('should set the quoteHeaders to an object if specified', () => {
            expect(createOptions({ quoteHeaders: { a: true, b: false } }).quoteHeaders).toEqual({
                a: true,
                b: false,
            });
        });
    });

    describe('#headers', () => {
        it('should have default headers', () => {
            expect(createOptions().headers).toBeNull();
        });

        it('should accept an array of headers', () => {
            expect(createOptions({ headers: ['1', '2', '3'] }).headers).toEqual(['1', '2', '3']);
        });

        it('should accept an boolean and set headers to null', () => {
            expect(createOptions({ headers: true }).headers).toBeNull();
        });

        it('should set hasHeaders provided to true if headers is provided as an array', () => {
            expect(createOptions({ headers: ['1', '2', '3'] }).shouldWriteHeaders).toBe(true);
        });

        it('should set hasHeaders provided to false if headers is provided as a boolean', () => {
            expect(createOptions({ headers: true }).shouldWriteHeaders).toBe(true);
        });
    });

    describe('#shouldWriteHeaders', () => {
        it('should set to true if headers is true', () => {
            expect(createOptions({ headers: true }).shouldWriteHeaders).toBe(true);
        });

        it('should set to false if headers is true and writeHeaders is false', () => {
            expect(createOptions({ headers: true, writeHeaders: false }).shouldWriteHeaders).toBe(false);
        });

        it('should set to true if headers is true and writeHeaders is true', () => {
            expect(createOptions({ headers: true, writeHeaders: true }).shouldWriteHeaders).toBe(true);
        });

        it('should set to true if headers is an array', () => {
            expect(createOptions({ headers: ['h1', 'h2'] }).shouldWriteHeaders).toBe(true);
        });

        it('should set to false if headers is an array and writeHeaders is false', () => {
            expect(createOptions({ headers: ['h1', 'h2'], writeHeaders: false }).shouldWriteHeaders).toBe(false);
        });

        it('should set to true if headers is an array and writeHeaders is true', () => {
            expect(createOptions({ headers: ['h1', 'h2'], writeHeaders: true }).shouldWriteHeaders).toBe(true);
        });

        it('should set to false if headers is not defined', () => {
            expect(createOptions({}).shouldWriteHeaders).toBe(false);
        });

        it('should set to false if headers is not defined and writeHeaders is true', () => {
            expect(createOptions({ writeHeaders: true }).shouldWriteHeaders).toBe(false);
        });
    });

    describe('#includeEndRowDelimiter', () => {
        it('should set includeEndRowDelimiter to false by default', () => {
            expect(createOptions().includeEndRowDelimiter).toBe(false);
        });

        it('should set to true if the includeEndRowDelimiter is specified', () => {
            expect(createOptions({ includeEndRowDelimiter: true }).includeEndRowDelimiter).toBe(true);
        });
    });

    describe('#writeBOM', () => {
        it('should set writeBOM to false by default', () => {
            expect(createOptions().writeBOM).toBe(false);
        });

        it('should set to true if the writeBOM is specified', () => {
            expect(createOptions({ writeBOM: true }).writeBOM).toBe(true);
        });
    });

    describe('#alwaysWriteHeaders', () => {
        it('should set alwaysWriteHeaders to false by default', () => {
            expect(createOptions().alwaysWriteHeaders).toBe(false);
        });

        it('should set to provided value if the alwaysWriteHeaders is specified', () => {
            expect(createOptions({ alwaysWriteHeaders: true }).alwaysWriteHeaders).toBe(true);
        });
    });
});
