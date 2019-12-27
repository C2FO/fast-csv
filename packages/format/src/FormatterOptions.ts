import { Row, RowTransformFunction } from './types';

interface QuoteColumnMap {
    [s: string]: boolean;
}

type QuoteColumns = boolean | boolean[] | QuoteColumnMap;

export interface FormatterOptionsArgs<I extends Row, O extends Row> {
    objectMode?: boolean;
    delimiter?: string;
    rowDelimiter?: string;
    quote?: string | boolean;
    escape?: string;
    quoteColumns?: QuoteColumns;
    quoteHeaders?: QuoteColumns;
    headers?: null | boolean | string[];
    writeHeaders?: boolean;
    includeEndRowDelimiter?: boolean;
    writeBOM?: boolean;
    transform?: RowTransformFunction<I, O>;
    alwaysWriteHeaders?: boolean;
}

export class FormatterOptions<I extends Row, O extends Row> {
    public readonly objectMode: boolean = true;

    public readonly delimiter: string = ',';

    public readonly rowDelimiter: string = '\n';

    public readonly quote: string = '"';

    public readonly escape: string = this.quote;

    public readonly quoteColumns: QuoteColumns = false;

    public readonly quoteHeaders: QuoteColumns = this.quoteColumns;

    public readonly headers: null | string[] = null;

    public readonly includeEndRowDelimiter: boolean = false;

    public readonly transform?: RowTransformFunction<I, O>;

    public readonly shouldWriteHeaders: boolean;

    public readonly writeBOM: boolean = false;

    public readonly escapedQuote: string;

    public readonly BOM: string = '\ufeff';

    public readonly alwaysWriteHeaders: boolean = false;

    public constructor(opts: FormatterOptionsArgs<I, O> = {}) {
        Object.assign(this, opts || {});

        if (typeof opts?.quoteHeaders === 'undefined') {
            this.quoteHeaders = this.quoteColumns;
        }
        if (opts?.quote === true) {
            this.quote = '"';
        } else if (opts?.quote === false) {
            this.quote = '';
        }
        if (typeof opts?.escape !== 'string') {
            this.escape = this.quote;
        }
        this.shouldWriteHeaders = !!this.headers && (opts.writeHeaders ?? true);
        this.headers = Array.isArray(this.headers) ? this.headers : null;
        this.escapedQuote = `${this.escape}${this.quote}`;
    }
}
