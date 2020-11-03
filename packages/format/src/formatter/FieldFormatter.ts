import isBoolean from 'lodash.isboolean';
import isNil from 'lodash.isnil';
import escapeRegExp from 'lodash.escaperegexp';
import { FormatterOptions } from '../FormatterOptions';
import { Row } from '../types';

export class FieldFormatter<I extends Row, O extends Row> {
    private readonly formatterOptions: FormatterOptions<I, O>;

    private _headers: string[] | null = null;

    private readonly REPLACE_REGEXP: RegExp;

    private readonly ESCAPE_REGEXP: RegExp;

    public constructor(formatterOptions: FormatterOptions<I, O>) {
        this.formatterOptions = formatterOptions;
        if (formatterOptions.headers !== null) {
            this.headers = formatterOptions.headers;
        }
        this.REPLACE_REGEXP = new RegExp(formatterOptions.quote, 'g');
        const escapePattern = `[${formatterOptions.delimiter}${escapeRegExp(formatterOptions.rowDelimiter)}|\r|\n]`;
        this.ESCAPE_REGEXP = new RegExp(escapePattern);
    }

    public set headers(headers: string[]) {
        this._headers = headers;
    }

    private shouldQuote(fieldIndex: number, isHeader: boolean): boolean {
        const quoteConfig = isHeader ? this.formatterOptions.quoteHeaders : this.formatterOptions.quoteColumns;
        if (isBoolean(quoteConfig)) {
            return quoteConfig;
        }
        if (Array.isArray(quoteConfig)) {
            return quoteConfig[fieldIndex];
        }
        if (this._headers !== null) {
            return quoteConfig[this._headers[fieldIndex]];
        }
        return false;
    }

    public format(field: string, fieldIndex: number, isHeader: boolean): string {
        const preparedField = `${isNil(field) ? '' : field}`.replace(/\0/g, '');
        const { formatterOptions } = this;
        if (formatterOptions.quote !== '') {
            const shouldEscape = preparedField.indexOf(formatterOptions.quote) !== -1;
            if (shouldEscape) {
                return this.quoteField(preparedField.replace(this.REPLACE_REGEXP, formatterOptions.escapedQuote));
            }
        }
        const hasEscapeCharacters = preparedField.search(this.ESCAPE_REGEXP) !== -1;
        if (hasEscapeCharacters || this.shouldQuote(fieldIndex, isHeader)) {
            return this.quoteField(preparedField);
        }
        return preparedField;
    }

    private quoteField(field: string): string {
        const { quote } = this.formatterOptions;
        return `${quote}${field}${quote}`;
    }
}
