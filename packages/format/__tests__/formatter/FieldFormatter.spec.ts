import { FormatterOptions, FormatterOptionsArgs, Row } from '../../src';
import { FieldFormatter } from '../../src/formatter';

describe('FieldFormatter', () => {
    const createFormatter = <I extends Row, O extends Row>(formatterOptions: FormatterOptionsArgs<I, O> = {}) => {
        return new FieldFormatter(new FormatterOptions(formatterOptions));
    };

    describe('#format', () => {
        describe('header columns', () => {
            it('should return the field not quoted if it contains no quotes', () => {
                const formatter = createFormatter();
                expect(formatter.format('header', 0, true)).toEqual('header');
            });

            it('should quote the field and escape quotes if it contains a quote character', () => {
                const formatter = createFormatter();
                expect(formatter.format('hea"d"er', 0, true)).toEqual('"hea""d""er"');
            });

            it('should quote the field and if it contains a rowDelimiter', () => {
                const formatter = createFormatter({ rowDelimiter: '\r\n' });
                expect(formatter.format('hea\r\nder', 0, true)).toEqual('"hea\r\nder"');
            });

            it('should quote the field and if it contains a CR', () => {
                // set row delimiter to something else to ensure it will still quote
                const formatter = createFormatter({ rowDelimiter: '#' });
                expect(formatter.format('hea\rder', 0, true)).toEqual('"hea\rder"');
            });

            it('should quote the field and if it contains a LF', () => {
                // set row delimiter to something else to ensure it will still quote
                const formatter = createFormatter({ rowDelimiter: '#' });
                expect(formatter.format('hea\nder', 0, true)).toEqual('"hea\nder"');
            });

            it('should quote the field and if it contains a CRLF', () => {
                // set row delimiter to something else to ensure it will still quote
                const formatter = createFormatter({ rowDelimiter: '#' });
                expect(formatter.format('hea\r\nder', 0, true)).toEqual('"hea\r\nder"');
            });

            it('should quote the field if quoteHeaders is true', () => {
                const formatter = createFormatter({ quoteHeaders: true });
                expect(formatter.format('header', 0, true)).toEqual('"header"');
            });

            it('should quote the header if quote headers is an array and the index of the header is true in the quoteHeaders array', () => {
                const formatter = createFormatter({ quoteHeaders: [true] });
                expect(formatter.format('header', 0, true)).toEqual('"header"');
            });

            it('should not quote the header if quote headers is an array and the index of the header is false in the quoteHeaders array', () => {
                const formatter = createFormatter({ quoteHeaders: [false] });
                expect(formatter.format('header', 0, true)).toEqual('header');
            });

            it('should quote the header if quoteHeaders is an object and quoteHeaders object has true for the column name', () => {
                const formatter = createFormatter({ quoteHeaders: { header: true }, headers: ['header'] });
                expect(formatter.format('header', 0, true)).toEqual('"header"');
            });

            it('should not quote the header if quoteHeaders is an object and quoteHeaders object has false for the column nam', () => {
                const formatter = createFormatter({ quoteHeaders: { header: false }, headers: ['header'] });
                expect(formatter.format('header', 0, true)).toEqual('header');
            });

            it('should not quote the header if quoteHeaders is an object and quoteHeaders object does not contain the header', () => {
                const formatter = createFormatter({ quoteHeaders: { header2: true }, headers: ['header'] });
                expect(formatter.format('header', 0, true)).toEqual('header');
            });
        });

        describe('non-header columns', () => {
            it('should return the field not quoted if it contains no quotes', () => {
                const formatter = createFormatter();
                expect(formatter.format('col', 0, false)).toEqual('col');
            });

            it('should quote the field and escape quotes if it contains a quote character', () => {
                const formatter = createFormatter();
                expect(formatter.format('c"o"l', 0, false)).toEqual('"c""o""l"');
            });

            it('should quote the field if it contains a rowDelimiter', () => {
                const formatter = createFormatter({ rowDelimiter: '\r\n' });
                expect(formatter.format('col\r\n', 0, false)).toEqual('"col\r\n"');
            });

            it('should quote the field if quoteColumns is true', () => {
                const formatter = createFormatter({ quoteColumns: true });
                expect(formatter.format('col', 0, false)).toEqual('"col"');
            });

            it('should quote the header if quote headers is an array and the index of the header is true in the quoteColumns array', () => {
                const formatter = createFormatter({ quoteColumns: [true] });
                expect(formatter.format('col', 0, false)).toEqual('"col"');
            });

            it('should not quote the header if quote headers is an array and the index of the header is false in the quoteColumns array', () => {
                const formatter = createFormatter({ quoteColumns: [false] });
                expect(formatter.format('col', 0, false)).toEqual('col');
            });

            it('should quote the header if quoteColumns is an object and quoteColumns object has true for the column name', () => {
                const formatter = createFormatter({ quoteColumns: { header: true }, headers: ['header'] });
                expect(formatter.format('col', 0, false)).toEqual('"col"');
            });

            it('should not quote the header if quoteColumns is an object and quoteColumns object has false for the column nam', () => {
                const formatter = createFormatter({ quoteColumns: { header: false }, headers: ['header'] });
                expect(formatter.format('col', 0, false)).toEqual('col');
            });

            it('should not quote the header if quoteColumns is an object and quoteColumns object does not contain the header', () => {
                const formatter = createFormatter({ quoteColumns: { header2: true }, headers: ['header'] });
                expect(formatter.format('col', 0, false)).toEqual('col');
            });
        });
    });
});
