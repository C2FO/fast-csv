import * as assert from 'assert';
import FieldFormatter from '../../../src/formatter/formatter/FieldFormatter';
import { FormatterOptions } from '../../../src/formatter/FormatterOptions';

describe('FieldFormatter', () => {
    describe('#format', () => {
        const createFormatter = (formatterOptions = {}, headers?: string[]) => {
            const formatter = new FieldFormatter(new FormatterOptions(formatterOptions));
            if (headers) {
                formatter.headers = headers;
            }
            return formatter;
        };

        const formatField = (field: string, fieldIndex: number, isHeader: boolean, fieldFormatter: FieldFormatter) =>
            fieldFormatter.format(field, fieldIndex, isHeader);

        describe('header columns', () => {
            it('should return the field not quoted if it contains no quotes', () => {
                const formatter = createFormatter();
                assert.strictEqual(formatField('header', 0, true, formatter), 'header');
            });

            it('should quote the field and escape quotes if it contains a quote character', () => {
                const formatter = createFormatter();
                assert.strictEqual(formatField('hea"d"er', 0, true, formatter), '"hea""d""er"');
            });

            it('should quote the field and if it contains a rowDelimiter', () => {
                const formatter = createFormatter({ rowDelimiter: '\r\n' });
                assert.strictEqual(formatField('hea\r\nder', 0, true, formatter), '"hea\r\nder"');
            });

            it('should quote the field if quoteHeaders is true', () => {
                const formatter = createFormatter({ quoteHeaders: true });
                assert.strictEqual(formatField('header', 0, true, formatter), '"header"');
            });

            it('should quote the header if quote headers is an array and the index of the header is true in the quoteHeaders array', () => {
                const formatter = createFormatter({ quoteHeaders: [true] });
                assert.strictEqual(formatField('header', 0, true, formatter), '"header"');
            });

            it('should not quote the header if quote headers is an array and the index of the header is false in the quoteHeaders array', () => {
                const formatter = createFormatter({ quoteHeaders: [false] });
                assert.strictEqual(formatField('header', 0, true, formatter), 'header');
            });

            it('should quote the header if quoteHeaders is an object and quoteHeaders object has true for the column name', () => {
                const formatter = createFormatter({ quoteHeaders: { header: true } }, ['header']);
                assert.strictEqual(formatField('header', 0, true, formatter), '"header"');
            });

            it('should not quote the header if quoteHeaders is an object and quoteHeaders object has false for the column nam', () => {
                const formatter = createFormatter({ quoteHeaders: { header: false } }, ['header']);
                assert.strictEqual(formatField('header', 0, true, formatter), 'header');
            });

            it('should not quote the header if quoteHeaders is an object and quoteHeaders object does not contain the header', () => {
                const formatter = createFormatter({ quoteHeaders: { header2: true } }, ['header']);
                assert.strictEqual(formatField('header', 0, true, formatter), 'header');
            });
        });

        describe('non-header columns', () => {
            it('should return the field not quoted if it contains no quotes', () => {
                const formatter = createFormatter();
                assert.strictEqual(formatField('col', 0, false, formatter), 'col');
            });

            it('should quote the field and escape quotes if it contains a quote character', () => {
                const formatter = createFormatter();
                assert.strictEqual(formatField('c"o"l', 0, false, formatter), '"c""o""l"');
            });

            it('should quote the field if it contains a rowDelimiter', () => {
                const formatter = createFormatter({ rowDelimiter: '\r\n' });
                assert.strictEqual(formatField('col\r\n', 0, false, formatter), '"col\r\n"');
            });

            it('should quote the field if quoteColumns is true', () => {
                const formatter = createFormatter({ quoteColumns: true });
                assert.strictEqual(formatField('col', 0, false, formatter), '"col"');
            });

            it('should quote the header if quote headers is an array and the index of the header is true in the quoteColumns array', () => {
                const formatter = createFormatter({ quoteColumns: [true] });
                assert.strictEqual(formatField('col', 0, false, formatter), '"col"');
            });

            it('should not quote the header if quote headers is an array and the index of the header is false in the quoteColumns array', () => {
                const formatter = createFormatter({ quoteColumns: [false] });
                assert.strictEqual(formatField('col', 0, false, formatter), 'col');
            });

            it('should quote the header if quoteColumns is an object and quoteColumns object has true for the column name', () => {
                const formatter = createFormatter({ quoteColumns: { header: true } }, ['header']);
                assert.strictEqual(formatField('col', 0, false, formatter), '"col"');
            });

            it('should not quote the header if quoteColumns is an object and quoteColumns object has false for the column nam', () => {
                const formatter = createFormatter({ quoteColumns: { header: false } }, ['header']);
                assert.strictEqual(formatField('col', 0, false, formatter), 'col');
            });

            it('should not quote the header if quoteColumns is an object and quoteColumns object does not contain the header', () => {
                const formatter = createFormatter({ quoteColumns: { header2: true } }, ['header']);
                assert.strictEqual(formatField('col', 0, false, formatter), 'col');
            });
        });
    });
});
