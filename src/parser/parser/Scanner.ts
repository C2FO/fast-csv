import { ParserOptions } from '../ParserOptions';

const ROW_DELIMITER = /((?:\r\n)|\n|\r)/;

interface TokenArgs{
    token: string;
    startCursor: number;
    endCursor: number;
}

export type MaybeToken = Token | null;

export class Token {
    public static isTokenRowDelimiter(token: Token): boolean {
        const content = token.token;
        return content === '\r' || content === '\n' || content === '\r\n';
    }

    public static isTokenCarriageReturn(token: Token, parserOptions: ParserOptions): boolean {
        return token.token === parserOptions.carriageReturn;
    }

    public static isTokenComment(token: Token, parserOptions: ParserOptions): boolean {
        return parserOptions.supportsComments && !!token && token.token === parserOptions.comment;
    }

    public static isTokenEscapeCharacter(token: Token, parserOptions: ParserOptions): boolean {
        return token.token === parserOptions.escapeChar;
    }

    public static isTokenQuote(token: Token, parserOptions: ParserOptions): boolean {
        return token.token === parserOptions.quote;
    }

    public static isTokenDelimiter(token: Token, parserOptions: ParserOptions): boolean {
        return token.token === parserOptions.delimiter;
    }

    public readonly token: string;

    public readonly startCursor: number;

    public readonly endCursor: number;

    public constructor(tokenArgs: TokenArgs) {
        this.token = tokenArgs.token;
        this.startCursor = tokenArgs.startCursor;
        this.endCursor = tokenArgs.endCursor;
    }
}

interface ScannerArgs{
    line: string;
    parserOptions: ParserOptions;
    hasMoreData: boolean;
    cursor?: number;
}

export class Scanner {
    public line: string;

    private readonly parserOptions: ParserOptions;

    public lineLength: number;

    public readonly hasMoreData: boolean;

    public cursor: number = 0;

    public constructor(args: ScannerArgs) {
        this.line = args.line;
        this.lineLength = this.line.length;
        this.parserOptions = args.parserOptions;
        this.hasMoreData = args.hasMoreData;
        this.cursor = args.cursor || 0;
    }

    public get hasMoreCharacters(): boolean {
        return this.lineLength > this.cursor;
    }

    public get nextNonSpaceToken(): MaybeToken {
        const { lineFromCursor } = this;
        const regex = this.parserOptions.NEXT_TOKEN_REGEXP;
        if (lineFromCursor.search(regex) === -1) {
            return null;
        }
        const match = lineFromCursor.match(regex);
        if (match == null) {
            return null;
        }
        const token = match[1];
        const startCursor = this.cursor + (match.index || 0);
        return new Token({
            token,
            startCursor,
            endCursor: startCursor + token.length - 1,
        });
    }

    public get nextCharacterToken(): MaybeToken {
        const { cursor, lineLength } = this;
        if (lineLength <= cursor) {
            return null;
        }
        return new Token({
            token: this.line[cursor],
            startCursor: cursor,
            endCursor: cursor,
        });
    }

    public get lineFromCursor(): string {
        return this.line.substr(this.cursor);
    }

    public advancePastLine(): Scanner | null {
        const match = this.lineFromCursor.match(ROW_DELIMITER);
        if (!match) {
            if (this.hasMoreData) {
                return null;
            }
            this.cursor = this.lineLength;
            return this;
        }
        this.cursor += (match.index || 0) + match[0].length;
        return this;
    }

    public advanceTo(cursor: number): Scanner {
        this.cursor = cursor;
        return this;
    }

    public advanceToToken(token: Token): Scanner {
        this.cursor = token.startCursor;
        return this;
    }

    public advancePastToken(token: Token): Scanner {
        this.cursor = token.endCursor + 1;
        return this;
    }

    public truncateToCursor(): Scanner {
        this.line = this.lineFromCursor;
        this.lineLength = this.line.length;
        this.cursor = 0;
        return this;
    }
}
