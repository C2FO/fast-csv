import { ParserOptions } from '../../ParserOptions';
import NonQuotedColumnParser from './NonQuotedColumnParser';
import QuotedColumnParser from './QuotedColumnParser';
import { Scanner, Token } from '../Scanner';

export default class ColumnParser {
    private readonly parserOptions: ParserOptions;

    public readonly nonQuotedColumnParser: NonQuotedColumnParser;

    public readonly quotedColumnParser: QuotedColumnParser;

    public constructor(parserOptions: ParserOptions) {
        this.parserOptions = parserOptions;
        this.quotedColumnParser = new QuotedColumnParser(parserOptions);
        this.nonQuotedColumnParser = new NonQuotedColumnParser(parserOptions);
    }

    public parse(scanner: Scanner): string | null {
        const { nextNonSpaceToken } = scanner;
        if (nextNonSpaceToken !== null && Token.isTokenQuote(nextNonSpaceToken, this.parserOptions)) {
            scanner.advanceToToken(nextNonSpaceToken);
            return this.quotedColumnParser.parse(scanner);
        }
        return this.nonQuotedColumnParser.parse(scanner);
    }
}
