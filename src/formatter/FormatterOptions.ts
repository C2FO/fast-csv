import { RowTransformFunction } from './types';

interface QuoteColumnMap{
    [s: string]: boolean;
}

type QuoteColumns = boolean | boolean[] | QuoteColumnMap

export interface FormatterOptionsArgs {
    objectMode?: boolean;
    delimiter?: string;
    rowDelimiter?: string;
    quote?: string | boolean;
    escape?: string;
    quoteColumns?: QuoteColumns;
    quoteHeaders?: QuoteColumns;
    headers?: null | boolean | string[];
    includeEndRowDelimiter?: boolean;
    writeBOM?: boolean;
    transform?: RowTransformFunction;
}

export class FormatterOptions {
    public readonly objectMode: boolean = true;

    public readonly delimiter: string = ',';

    public readonly rowDelimiter: string = '\n';

    public readonly quote: string = '"';

    public readonly escape: string = this.quote;

    public readonly quoteColumns: QuoteColumns = false;

    public readonly quoteHeaders: QuoteColumns = this.quoteColumns;

    public readonly headers: null | string[] = null;

    public readonly includeEndRowDelimiter: boolean = false;

    public readonly transform: RowTransformFunction | null = null;

    public readonly shouldWriteHeaders: boolean;

    public readonly writeBOM: boolean = false;

    public readonly escapedQuote: string;

    public readonly BOM: string = '\ufeff';

    public constructor(opts: FormatterOptionsArgs = {}) {
        if (opts) {
            Object.assign(this, opts);
            if (typeof opts.quoteHeaders === 'undefined') {
                this.quoteHeaders = this.quoteColumns;
            }
            if (opts.quote === true) {
                this.quote = '"';
            } else if (opts.quote === false) {
                this.quote = '';
            }
            if (typeof opts.escape !== 'string') {
                this.escape = this.quote;
            }
        }
        this.shouldWriteHeaders = !!this.headers;
        this.headers = Array.isArray(this.headers) ? this.headers : null;
        this.escapedQuote = `${this.escape}${this.quote}`;
    }
}
