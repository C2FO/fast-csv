import ColumnFormatter from './ColumnFormatter';
import { ParserOptions } from '../../ParserOptions';
import { Scanner, Token } from '../Scanner';

const {
    isTokenDelimiter, isTokenRowDelimiter, isTokenEscapeCharacter, isTokenQuote,
} = Token;

interface DataBetweenQuotes{
    foundClosingQuote: boolean;
    col: string;
}

export default class QuotedColumnParser {
    private readonly parserOptions: ParserOptions;

    private readonly columnFormatter: ColumnFormatter;

    public constructor(parserOptions: ParserOptions) {
        this.parserOptions = parserOptions;
        this.columnFormatter = new ColumnFormatter(parserOptions);
    }

    public parse(scanner: Scanner): string | null {
        if (!scanner.hasMoreCharacters) {
            return null;
        }
        const originalCursor = scanner.cursor;
        const { foundClosingQuote, col } = this.gatherDataBetweenQuotes(scanner);
        if (!foundClosingQuote) {
            // reset the cursor to the original
            scanner.advanceTo(originalCursor);
            // if we didnt find a closing quote but we potentially have more data then skip the parsing
            // and return the original scanner.
            if (!scanner.hasMoreData) {
                throw new Error(`Parse Error: missing closing: '${this.parserOptions.quote}' in line: at '${scanner.lineFromCursor.replace(/[r\n]/g, "\\n'")}'`);
            }
            return null;
        }
        this.checkForMalformedColumn(scanner);
        return col;
    }

    private gatherDataBetweenQuotes(scanner: Scanner): DataBetweenQuotes {
        const { parserOptions } = this;
        let foundStartingQuote = false;
        let foundClosingQuote = false;
        const characters = [];
        let nextToken: Token | null = scanner.nextCharacterToken;
        for (; !foundClosingQuote && nextToken !== null; nextToken = scanner.nextCharacterToken) {
            const isQuote = isTokenQuote(nextToken, parserOptions);
            // ignore first quote
            if (!foundStartingQuote && isQuote) {
                foundStartingQuote = true;
            } else if (foundStartingQuote) {
                if (isTokenEscapeCharacter(nextToken, parserOptions)) {
                    // advance past the escape character so we can get the next one in line
                    scanner.advancePastToken(nextToken);
                    const tokenFollowingEscape = scanner.nextCharacterToken;
                    // if the character following the escape is a quote character then just add
                    // the quote and advance to that character
                    if (tokenFollowingEscape !== null && isTokenQuote(tokenFollowingEscape, parserOptions)) {
                        characters.push(tokenFollowingEscape.token);
                        nextToken = tokenFollowingEscape;
                    } else if (isQuote) {
                        // if the escape is also a quote then we found our closing quote and finish early
                        foundClosingQuote = true;
                    } else {
                        // other wise add the escape token to the characters since it wast escaping anything
                        characters.push(nextToken.token);
                    }
                } else if (isQuote) {
                    // we found our closing quote!
                    foundClosingQuote = true;
                } else {
                    // add the token to the characters
                    characters.push(nextToken.token);
                }
            }
            scanner.advancePastToken(nextToken);
        }
        return { col: this.columnFormatter.format(characters.join('')), foundClosingQuote };
    }


    private checkForMalformedColumn(scanner: Scanner): void {
        const { parserOptions } = this;
        const { nextNonSpaceToken } = scanner;
        if (nextNonSpaceToken) {
            const isNextTokenADelimiter = isTokenDelimiter(nextNonSpaceToken, parserOptions);
            const isNextTokenARowDelimiter = isTokenRowDelimiter(nextNonSpaceToken);
            if (!(isNextTokenADelimiter || isNextTokenARowDelimiter)) {
                // if the final quote was NOT followed by a column (,) or row(\n) delimiter then its a bad column
                // tldr: only part of the column was quoted
                const linePreview = scanner.lineFromCursor.substr(0, 10).replace(/[\r\n]/g, "\\n'");
                throw new Error(`Parse Error: expected: '${parserOptions.escapedDelimiter}' OR new line got: '${nextNonSpaceToken.token}'. at '${linePreview}`);
            }
            scanner.advanceToToken(nextNonSpaceToken);
        } else if (!scanner.hasMoreData) {
            scanner.advancePastLine();
        }
    }
}
