import { RowTransformFunction } from './types';

interface QuoteColumnMap{
    [s: string]: boolean;
}

type QuoteColumns = boolean | boolean[] | QuoteColumnMap

export interface FormatterOptionsArgs {
    objectMode?: boolean;
    delimiter?: string;
    rowDelimiter?: string;
    quote?: string;
    escape?: string;
    quoteColumns?: QuoteColumns;
    quoteHeaders?: QuoteColumns;
    headers?: null | boolean | string[];
    includeEndRowDelimiter?: boolean;
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

    public readonly hasProvidedHeaders: boolean;

    public readonly escapedQuote: string;

    public constructor(opts: FormatterOptionsArgs = {}) {
        if (opts) {
            Object.assign(this, opts);
            if (typeof opts.quoteHeaders === 'undefined') {
                this.quoteHeaders = this.quoteColumns;
            }
            if (typeof opts.escape !== 'string') {
                this.escape = this.quote;
            }
        }
        this.hasProvidedHeaders = !!this.headers;
        this.headers = Array.isArray(this.headers) ? this.headers : null;
        this.escapedQuote = `${this.escape}${this.quote}`;
    }
}
