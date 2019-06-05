import { Scanner, Token } from './Scanner';
import { ColumnParser } from './column';
import { ParserOptions } from '../ParserOptions';
import { RowArray } from '../types';

const { isTokenRowDelimiter, isTokenCarriageReturn, isTokenDelimiter } = Token;

export default class RowParser {
    private readonly parserOptions: ParserOptions;

    private readonly columnParser: ColumnParser;

    public constructor(parserOptions: ParserOptions) {
        this.parserOptions = parserOptions;
        this.columnParser = new ColumnParser(parserOptions);
    }

    public parse(scanner: Scanner): RowArray | null {
        const { parserOptions } = this;
        const { hasMoreData } = scanner;
        const currentScanner = scanner;
        const columns: RowArray = [];
        let currentToken = this.getStartToken(currentScanner, columns);
        while (currentToken) {
            if (isTokenRowDelimiter(currentToken)) {
                currentScanner.advancePastToken(currentToken);
                // if ends with CR and there is more data, keep unparsed due to possible
                // coming LF in CRLF
                if (!currentScanner.hasMoreCharacters
                    && isTokenCarriageReturn(currentToken, parserOptions)
                    && hasMoreData) {
                    return null;
                }
                currentScanner.truncateToCursor();
                return columns;
            }
            if (!this.shouldSkipColumnParse(currentScanner, currentToken, columns)) {
                const item = this.columnParser.parse(currentScanner);
                if (item === null) {
                    return null;
                }
                columns.push(item);
            }
            currentToken = currentScanner.nextNonSpaceToken;
        }
        if (!hasMoreData) {
            currentScanner.truncateToCursor();
            return columns;
        }
        return null;
    }

    private getStartToken(scanner: Scanner, columns: RowArray): Token | null {
        const currentToken = scanner.nextNonSpaceToken;
        if (currentToken !== null && isTokenDelimiter(currentToken, this.parserOptions)) {
            columns.push('');
            return scanner.nextNonSpaceToken;
        }
        return currentToken;
    }

    private shouldSkipColumnParse(scanner: Scanner, currentToken: Token, columns: RowArray): boolean {
        const { parserOptions } = this;
        if (isTokenDelimiter(currentToken, parserOptions)) {
            scanner.advancePastToken(currentToken);
            // if the delimiter is at the end of a line
            const nextToken = scanner.nextCharacterToken;
            if (!scanner.hasMoreCharacters || (nextToken !== null && isTokenRowDelimiter(nextToken))) {
                columns.push('');
                return true;
            }
            if (nextToken !== null && isTokenDelimiter(nextToken, parserOptions)) {
                columns.push('');
                return true;
            }
        }
        return false;
    }
}
