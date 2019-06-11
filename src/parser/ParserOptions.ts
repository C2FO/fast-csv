import { escapeRegExp, isString, isNil } from 'lodash';

export interface ParserOptionsArgs{
    objectMode?: boolean;
    delimiter?: string;
    quote?: string | null;
    escape?: string;
    headers?: boolean | (string | undefined | null)[];
    renameHeaders?: boolean;
    ignoreEmpty?: boolean;
    comment?: string;
    strictColumnHandling?: boolean;
    discardUnmappedColumns?: boolean;
    trim?: boolean;
    ltrim?: boolean;
    rtrim?: boolean;
}

export class ParserOptions {
    public readonly escapedDelimiter: string;

    public readonly objectMode: boolean = true;

    public readonly delimiter: string = ',';

    public readonly ignoreEmpty: boolean = false;

    public readonly quote: string | null = '"';

    public readonly escape: string | null = null;

    public readonly escapeChar: string | null = this.quote;

    public readonly comment: string | null = null;

    public readonly supportsComments: boolean = false;

    public readonly ltrim: boolean = false ;

    public readonly rtrim: boolean = false;

    public readonly trim: boolean = false;

    public readonly headers: boolean | string[] | null = null;

    public readonly renameHeaders: boolean = false;

    public readonly strictColumnHandling: boolean = false;

    public readonly discardUnmappedColumns: boolean = false;

    public readonly carriageReturn: string = '\r';

    public readonly NEXT_TOKEN_REGEXP: RegExp;

    public constructor(opts?: ParserOptionsArgs) {
        Object.assign(this, opts || {});
        if (this.delimiter.length > 1) {
            throw new Error('delimiter option must be one character long');
        }
        this.escapedDelimiter = escapeRegExp(this.delimiter);
        this.escapeChar = isString(this.escape) ? this.escape : this.quote;
        this.supportsComments = !isNil(this.comment);
        this.NEXT_TOKEN_REGEXP = new RegExp(`([^\\s]|\\r\\n|\\n|\\r|${this.escapedDelimiter})`);
    }
}
