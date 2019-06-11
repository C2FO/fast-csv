import { isUndefined } from 'lodash';
import { ParserOptions } from '../ParserOptions';
import {
    Row, RowArray, RowMap, RowValidationResult, RowValidatorCallback,
} from '../types';

export default class HeaderTransformer {
    private readonly parserOptions: ParserOptions;

    private headers: RowArray | null;

    private receivedHeaders: boolean;

    private readonly shouldUseFirstRow: boolean;

    private processedFirstRow: boolean = false;

    private headersLength: number = 0;

    public constructor(parserOptions: ParserOptions) {
        this.parserOptions = parserOptions;
        this.headers = Array.isArray(parserOptions.headers) ? parserOptions.headers : null;
        this.receivedHeaders = Array.isArray(parserOptions.headers);
        this.shouldUseFirstRow = parserOptions.headers === true;
        if (this.receivedHeaders && this.headers) {
            this.headersLength = this.headers.length;
        }
    }

    public transform(row: RowArray, cb: RowValidatorCallback): void {
        if (!this.shouldMapRow(row)) {
            return cb(null, { row: null, isValid: true });
        }
        return cb(null, this.processRow(row));
    }

    private shouldMapRow(row: Row): boolean {
        const { parserOptions } = this;
        if (parserOptions.renameHeaders && !this.processedFirstRow) {
            if (!this.receivedHeaders) {
                throw new Error('Error renaming headers: new headers must be provided in an array');
            }
            this.processedFirstRow = true;
            return false;
        }
        if (!this.receivedHeaders && this.shouldUseFirstRow && Array.isArray(row)) {
            this.headers = row;
            this.receivedHeaders = true;
            this.headersLength = row.length;
            return false;
        }
        return true;
    }

    private processRow(row: RowArray): RowValidationResult {
        if (!this.headers) {
            return { row, isValid: true };
        }
        const { parserOptions } = this;
        if (!parserOptions.discardUnmappedColumns && row.length > this.headersLength) {
            if (!parserOptions.strictColumnHandling) {
                throw new Error(`Unexpected Error: column header mismatch expected: ${this.headersLength} columns got: ${row.length}`);
            }
            return { row, isValid: false, reason: `Column header mismatch expected: ${this.headersLength} columns got: ${row.length}` };
        }
        if (parserOptions.strictColumnHandling && (row.length < this.headersLength)) {
            return {
                row,
                isValid: false,
                reason: `Column header mismatch expected: ${this.headersLength} columns got: ${row.length}`,
            };
        }
        return { row: this.mapHeaders(row), isValid: true };
    }


    private mapHeaders(row: RowArray): Row {
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
        return rowMap;
    }
}
