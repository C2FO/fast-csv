import isUndefined from 'lodash.isundefined';
import isFunction from 'lodash.isfunction';
import uniq from 'lodash.uniq';
import groupBy from 'lodash.groupby';
import { ParserOptions } from '../ParserOptions';
import {
    HeaderArray,
    HeaderTransformFunction,
    Row,
    RowArray,
    RowMap,
    RowValidationResult,
    RowValidatorCallback,
} from '../types';

export class HeaderTransformer<O extends Row> {
    private readonly parserOptions: ParserOptions;

    headers: HeaderArray | null = null;

    private receivedHeaders = false;

    private readonly shouldUseFirstRow: boolean = false;

    private processedFirstRow = false;

    private headersLength = 0;

    private readonly headersTransform?: HeaderTransformFunction;

    public constructor(parserOptions: ParserOptions) {
        this.parserOptions = parserOptions;
        if (parserOptions.headers === true) {
            this.shouldUseFirstRow = true;
        } else if (Array.isArray(parserOptions.headers)) {
            this.setHeaders(parserOptions.headers);
        } else if (isFunction(parserOptions.headers)) {
            this.headersTransform = parserOptions.headers;
        }
    }

    public transform(row: RowArray, cb: RowValidatorCallback<O>): void {
        if (!this.shouldMapRow(row)) {
            return cb(null, { row: null, isValid: true });
        }
        return cb(null, this.processRow(row));
    }

    private shouldMapRow(row: Row): boolean {
        const { parserOptions } = this;
        if (!this.headersTransform && parserOptions.renameHeaders && !this.processedFirstRow) {
            if (!this.receivedHeaders) {
                throw new Error('Error renaming headers: new headers must be provided in an array');
            }
            this.processedFirstRow = true;
            return false;
        }
        if (!this.receivedHeaders && Array.isArray(row)) {
            if (this.headersTransform) {
                this.setHeaders(this.headersTransform(row));
            } else if (this.shouldUseFirstRow) {
                this.setHeaders(row);
            } else {
                // dont do anything with the headers if we didnt receive a transform or shouldnt use the first row.
                return true;
            }
            return false;
        }
        return true;
    }

    private processRow(row: RowArray<string>): RowValidationResult<O> {
        if (!this.headers) {
            return { row: (row as never) as O, isValid: true };
        }
        const { parserOptions } = this;
        if (!parserOptions.discardUnmappedColumns && row.length > this.headersLength) {
            if (!parserOptions.strictColumnHandling) {
                throw new Error(
                    `Unexpected Error: column header mismatch expected: ${this.headersLength} columns got: ${row.length}`,
                );
            }
            return {
                row: (row as never) as O,
                isValid: false,
                reason: `Column header mismatch expected: ${this.headersLength} columns got: ${row.length}`,
            };
        }
        if (parserOptions.strictColumnHandling && row.length < this.headersLength) {
            return {
                row: (row as never) as O,
                isValid: false,
                reason: `Column header mismatch expected: ${this.headersLength} columns got: ${row.length}`,
            };
        }
        return { row: this.mapHeaders(row), isValid: true };
    }

    private mapHeaders(row: RowArray<string>): O {
        const rowMap: RowMap = {};
        const { headers, headersLength } = this;
        for (let i = 0; i < headersLength; i += 1) {
            const header = (headers as string[])[i];
            if (!isUndefined(header)) {
                const val = row[i];
                // eslint-disable-next-line no-param-reassign
                if (isUndefined(val)) {
                    rowMap[header] = '';
                } else {
                    rowMap[header] = val;
                }
            }
        }
        return rowMap as O;
    }

    private setHeaders(headers: HeaderArray): void {
        const filteredHeaders = headers.filter((h) => !!h);
        if (uniq(filteredHeaders).length !== filteredHeaders.length) {
            const grouped = groupBy(filteredHeaders);
            const duplicates = Object.keys(grouped).filter((dup) => grouped[dup].length > 1);
            throw new Error(`Duplicate headers found ${JSON.stringify(duplicates)}`);
        }
        this.headers = headers;
        this.receivedHeaders = true;
        this.headersLength = this.headers?.length || 0;
    }
}
