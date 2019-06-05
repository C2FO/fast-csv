import { isFunction } from 'lodash';
import { FormatterOptions } from '../FormatterOptions';
import FieldFormatter from './FieldFormatter';
import {
    Row, RowHashArray, RowTransformFunction,
} from '../types';

type RowCallback = ((err?: Error | null, row?: Row) => void)

type RowFormatterTransform = (row: Row, cb: RowCallback) => void

type RowFormatterCallback = (error: Error | null, data?: string[]) => void;

export default class RowFormatter {
    private static isHashArray(row: Row): row is RowHashArray {
        if (Array.isArray(row)) {
            return Array.isArray(row[0]) && row[0].length === 2;
        }
        return false;
    }

    // get headers from a row item
    private static gatherHeaders(row: Row): string[] {
        if (RowFormatter.isHashArray(row)) {
            // lets assume a multi-dimesional array with item 0 being the header
            return row.map((it): string => it[0]);
        }
        if (Array.isArray(row)) {
            return row;
        }
        return Object.keys(row);
    }

    private static createTransform(transformFunction: RowTransformFunction): RowFormatterTransform {
        const isSync = transformFunction.length === 1;
        if (isSync) {
            return (row, cb): void => {
                let transformedRow = null;
                try {
                    transformedRow = transformFunction(row);
                } catch (e) {
                    return cb(e);
                }
                return cb(null, transformedRow);
            };
        }
        return (row, cb): void => {
            transformFunction(row, cb);
        };
    }

    private readonly formatterOptions: FormatterOptions;

    private readonly fieldFormatter: FieldFormatter;

    private _rowTransform?: null | RowFormatterTransform;

    private headers: string[] | null;

    private parsedHeaders: boolean;

    private hasWrittenHeaders: boolean;

    private rowCount: number = 0;


    public constructor(formatterOptions: FormatterOptions) {
        this.formatterOptions = formatterOptions;
        this.fieldFormatter = new FieldFormatter(formatterOptions);
        this._rowTransform = null;
        this.headers = formatterOptions.headers;
        this.parsedHeaders = formatterOptions.hasProvidedHeaders && Array.isArray(formatterOptions.headers);
        this.hasWrittenHeaders = !formatterOptions.hasProvidedHeaders;
        if (this.parsedHeaders && this.headers !== null) {
            this.fieldFormatter.headers = this.headers;
        }
        if (formatterOptions.transform !== null) {
            this.rowTransform = formatterOptions.transform;
        }
    }

    public set rowTransform(transformFunction: RowTransformFunction) {
        if (!isFunction(transformFunction)) {
            throw new TypeError('The transform should be a function');
        }
        this._rowTransform = RowFormatter.createTransform(transformFunction);
    }

    public format(row: Row, cb: RowFormatterCallback): void {
        this.callTransformer(row, (err, transformedRow?: Row): void => {
            if (err) {
                return cb(err);
            }
            if (!row) {
                return cb(null);
            }
            const rows = [];
            if (transformedRow) {
                const { shouldFormatColumns, headers } = this.checkHeaders(transformedRow);
                if (headers) {
                    rows.push(this.formatColumns(headers, true));
                }
                if (shouldFormatColumns) {
                    const columns = this.gatherColumns(transformedRow);
                    rows.push(this.formatColumns(columns, false));
                }
            }
            return cb(null, rows);
        });
    }

    // check if we need to write header return true if we should also write a row
    // could be false if headers is true and the header row(first item) is passed in
    private checkHeaders(row: Row): { headers?: string[] | null; shouldFormatColumns: boolean } {
        if (!this.parsedHeaders) {
            this.parsedHeaders = true;
            this.headers = RowFormatter.gatherHeaders(row);
            this.fieldFormatter.headers = this.headers;
        }
        if (this.hasWrittenHeaders) {
            return { shouldFormatColumns: true, headers: null };
        }
        this.hasWrittenHeaders = true;
        const shouldFormatColumns = RowFormatter.isHashArray(row) || !Array.isArray(row);
        return { shouldFormatColumns, headers: this.headers };
    }

    private gatherColumns(row: Row): string[] {
        if (!Array.isArray(row)) {
            if (this.headers === null) {
                throw new Error('Headers is currently null');
            }
            return this.headers.map((header): string => row[header]);
        }
        if (RowFormatter.isHashArray(row)) {
            return row.map((col): string => col[1]);
        }
        return row;
    }

    private callTransformer(row: Row, cb: RowCallback): void {
        if (!this._rowTransform) {
            return cb(null, row);
        }
        return this._rowTransform(row, cb);
    }

    private formatColumns(columns: string[], isHeadersRow: boolean): string {
        const formattedCols = columns
            .map((field, i): string => this.fieldFormatter.format(field, i, isHeadersRow))
            .join(this.formatterOptions.delimiter);
        const { rowCount } = this;
        this.rowCount += 1;
        if (rowCount) {
            return [ this.formatterOptions.rowDelimiter, formattedCols ].join('');
        }
        return formattedCols;
    }
}
