import { ParserOptions } from '../ParserOptions';

export type MaybeToken = Token | null;

export interface TokenArgs {
    token: string;
    startCursor: number;
    endCursor: number;
}

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
        const delimiter = Array.isArray(parserOptions.delimiter) ? parserOptions.delimiter : [parserOptions.delimiter];
        return delimiter.includes(token.token);
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
