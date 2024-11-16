import escapeRegExp from 'lodash.escaperegexp';
import isNil from 'lodash.isnil';
import { HeaderArray, HeaderTransformFunction } from './types';

export interface ParserOptionsArgs {
    objectMode?: boolean;
    delimiter?: string | string[];
    quote?: string | null;
    escape?: string;
    headers?: boolean | HeaderTransformFunction | HeaderArray;
    renameHeaders?: boolean;
    ignoreEmpty?: boolean;
    comment?: string;
    strictColumnHandling?: boolean;
    discardUnmappedColumns?: boolean;
    trim?: boolean;
    ltrim?: boolean;
    rtrim?: boolean;
    encoding?: string;
    maxRows?: number;
    skipLines?: number;
    skipRows?: number;
}

export class ParserOptions {
    public readonly escapedDelimiter: string[];

    public readonly objectMode: boolean = true;

    public readonly delimiter: string = ',';

    public readonly ignoreEmpty: boolean = false;

    public readonly quote: string | null = '"';

    public readonly escape: string | null = null;

    public readonly escapeChar: string | null = this.quote;

    public readonly comment: string | null = null;

    public readonly supportsComments: boolean = false;

    public readonly ltrim: boolean = false;

    public readonly rtrim: boolean = false;

    public readonly trim: boolean = false;

    public readonly headers: boolean | HeaderTransformFunction | HeaderArray | null = null;

    public readonly renameHeaders: boolean = false;

    public readonly strictColumnHandling: boolean = false;

    public readonly discardUnmappedColumns: boolean = false;

    public readonly carriageReturn: string = '\r';

    public readonly NEXT_TOKEN_REGEXP: RegExp;

    public readonly encoding: BufferEncoding = 'utf8';

    public readonly limitRows: boolean = false;

    public readonly maxRows: number = 0;

    public readonly skipLines: number = 0;

    public readonly skipRows: number = 0;

    public constructor(opts?: ParserOptionsArgs) {
        Object.assign(this, opts || {});
        const delimiters = Array.isArray(this.delimiter) ? this.delimiter : [this.delimiter];
        if (
            delimiters.some((d: string) => {
                return d.length > 1;
            })
        ) {
            throw new Error('delimiter option must be one character long');
        }
        this.escapedDelimiter = delimiters.map((d) => {
            return escapeRegExp(d);
        });
        this.escapeChar = this.escape ?? this.quote;
        this.supportsComments = !isNil(this.comment);
        this.NEXT_TOKEN_REGEXP = new RegExp(`([^\\s]|\\r\\n|\\n|\\r|${this.escapedDelimiter.join('|')})`);

        if (this.maxRows > 0) {
            this.limitRows = true;
        }
    }
}
