import isFunction from 'lodash.isfunction';
import isEqual from 'lodash.isequal';
import { FormatterOptions } from '../FormatterOptions';
import { FieldFormatter } from './FieldFormatter';
import { isSyncTransform, Row, RowArray, RowHashArray, RowTransformCallback, RowTransformFunction } from '../types';

type RowFormatterTransform<I extends Row, O extends Row> = (row: I, cb: RowTransformCallback<O>) => void;

type RowFormatterCallback = (error: Error | null, data?: RowArray) => void;

export class RowFormatter<I extends Row, O extends Row> {
    private static isRowHashArray(row: Row): row is RowHashArray {
        if (Array.isArray(row)) {
            return Array.isArray(row[0]) && row[0].length === 2;
        }
        return false;
    }

    private static isRowArray(row: Row): row is RowArray {
        return Array.isArray(row) && !this.isRowHashArray(row);
    }

    // get headers from a row item
    private static gatherHeaders(row: Row): string[] {
        if (RowFormatter.isRowHashArray(row)) {
            // lets assume a multi-dimesional array with item 0 being the header
            return row.map((it): string => it[0]);
        }
        if (Array.isArray(row)) {
            return row;
        }
        return Object.keys(row);
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    private static createTransform<I extends Row, O extends Row>(
        transformFunction: RowTransformFunction<I, O>,
    ): RowFormatterTransform<I, O> {
        if (isSyncTransform(transformFunction)) {
            return (row: I, cb: RowTransformCallback<O>): void => {
                let transformedRow = null;
                try {
                    transformedRow = transformFunction(row);
                } catch (e) {
                    return cb(e);
                }
                return cb(null, transformedRow);
            };
        }
        return (row: I, cb: RowTransformCallback<O>): void => {
            transformFunction(row, cb);
        };
    }

    private readonly formatterOptions: FormatterOptions<I, O>;

    private readonly fieldFormatter: FieldFormatter<I, O>;

    private readonly shouldWriteHeaders: boolean;

    private _rowTransform?: RowFormatterTransform<I, O>;

    private headers: string[] | null;

    private hasWrittenHeaders: boolean;

    private rowCount = 0;

    public constructor(formatterOptions: FormatterOptions<I, O>) {
        this.formatterOptions = formatterOptions;
        this.fieldFormatter = new FieldFormatter(formatterOptions);

        this.headers = formatterOptions.headers;
        this.shouldWriteHeaders = formatterOptions.shouldWriteHeaders;
        this.hasWrittenHeaders = false;
        if (this.headers !== null) {
            this.fieldFormatter.headers = this.headers;
        }
        if (formatterOptions.transform) {
            this.rowTransform = formatterOptions.transform;
        }
    }

    public set rowTransform(transformFunction: RowTransformFunction<I, O>) {
        if (!isFunction(transformFunction)) {
            throw new TypeError('The transform should be a function');
        }
        this._rowTransform = RowFormatter.createTransform(transformFunction);
    }

    public format(row: I, cb: RowFormatterCallback): void {
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
                if (this.shouldWriteHeaders && headers && !this.hasWrittenHeaders) {
                    rows.push(this.formatColumns(headers, true));
                    this.hasWrittenHeaders = true;
                }
                if (shouldFormatColumns) {
                    const columns = this.gatherColumns(transformedRow);
                    rows.push(this.formatColumns(columns, false));
                }
            }
            return cb(null, rows);
        });
    }

    public finish(cb: RowFormatterCallback): void {
        const rows = [];
        // check if we should write headers and we didnt get any rows
        if (this.formatterOptions.alwaysWriteHeaders && this.rowCount === 0) {
            if (!this.headers) {
                return cb(new Error('`alwaysWriteHeaders` option is set to true but `headers` option not provided.'));
            }
            rows.push(this.formatColumns(this.headers, true));
        }
        if (this.formatterOptions.includeEndRowDelimiter) {
            rows.push(this.formatterOptions.rowDelimiter);
        }
        return cb(null, rows);
    }

    // check if we need to write header return true if we should also write a row
    // could be false if headers is true and the header row(first item) is passed in
    private checkHeaders(row: Row): { headers?: string[] | null; shouldFormatColumns: boolean } {
        if (this.headers) {
            // either the headers were provided by the user or we have already gathered them.
            return { shouldFormatColumns: true, headers: this.headers };
        }
        const headers = RowFormatter.gatherHeaders(row);
        this.headers = headers;
        this.fieldFormatter.headers = headers;
        if (!this.shouldWriteHeaders) {
            // if we are not supposed to write the headers then
            // always format the columns
            return { shouldFormatColumns: true, headers: null };
        }
        // if the row is equal to headers dont format
        return { shouldFormatColumns: !isEqual(headers, row), headers };
    }

    // todo change this method to unknown[]
    private gatherColumns(row: Row): string[] {
        if (this.headers === null) {
            throw new Error('Headers is currently null');
        }
        if (!Array.isArray(row)) {
            return this.headers.map((header): string => row[header] as string);
        }
        if (RowFormatter.isRowHashArray(row)) {
            return this.headers.map((header, i): string => {
                const col = (row[i] as unknown) as string;
                if (col) {
                    return col[1];
                }
                return '';
            });
        }
        // if its a one dimensional array and headers were not provided
        // then just return the row
        if (RowFormatter.isRowArray(row) && !this.shouldWriteHeaders) {
            return row;
        }
        return this.headers.map((header, i): string => row[i]);
    }

    private callTransformer(row: I, cb: RowTransformCallback<O>): void {
        if (!this._rowTransform) {
            return cb(null, (row as unknown) as O);
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
            return [this.formatterOptions.rowDelimiter, formattedCols].join('');
        }
        return formattedCols;
    }
}
