import { ParserOptions, ParserOptionsArgs } from '../../src';
import { MaybeToken, Scanner, Token } from '../../src/parser';

const createOptions = (opts: ParserOptionsArgs = {}) => {
    return new ParserOptions(opts);
};
describe('Scanner', () => {
    const getScanner = (line: string, hasMoreData: boolean, cursor = 0, parserOpts: ParserOptionsArgs = {}) => {
        return new Scanner({
            line,
            parserOptions: createOptions(parserOpts),
            hasMoreData,
            cursor,
        });
    };

    const expectNonNullToken = (token: MaybeToken): token is Token => {
        expect(token).not.toBeNull();
        return true;
    };

    const expectTokenContent = (token: MaybeToken, content: string): void => {
        if (expectNonNullToken(token)) {
            expect(token.token).toBe(content);
        }
    };

    describe('#hasMoreCharacters', () => {
        it('should return true if the cursor is not past the end of the line', () => {
            expect(getScanner('hello', true).hasMoreCharacters).toBe(true);
        });

        it('should return false if the cursor is not past the end of the line', () => {
            expect(getScanner('hello', true, 5).hasMoreCharacters).toBe(false);
        });
    });

    describe('#nextNonSpaceToken', () => {
        it('should get non space token in the line', () => {
            expectTokenContent(getScanner(' h', true, 0).nextNonSpaceToken, 'h');
        });

        it('should get the LF in the line', () => {
            expectTokenContent(getScanner(' \n', true, 0).nextNonSpaceToken, '\n');
        });

        it('should get the CR in the line', () => {
            expectTokenContent(getScanner(' \r', true, 0).nextNonSpaceToken, '\r');
        });

        it('should get the CRLF in the line', () => {
            expectTokenContent(getScanner(' \r\n', true, 0).nextNonSpaceToken, '\r\n');
        });

        it('should return null if there is nothing but white space', () => {
            expect(getScanner('    \t', true, 0).nextNonSpaceToken).toBeNull();
        });

        it('should return a token the delimiter is a space token', () => {
            expectTokenContent(getScanner('   \t', true, 0, { delimiter: '\t' }).nextNonSpaceToken, '\t');
        });
    });

    describe('#nextCharacterToken', () => {
        it('should get the next character in the line', () => {
            expectTokenContent(getScanner('h', true, 0).nextCharacterToken, 'h');
        });

        it('should get the next character in the line if it it whitespace', () => {
            expectTokenContent(getScanner(' h', true, 0).nextCharacterToken, ' ');
        });

        it('should return null if the cursor is at the end of the line', () => {
            expect(getScanner('hello', true, 5).nextCharacterToken).toBeNull();
        });
    });

    describe('#line from cursor', () => {
        it('should return the line from the current cursor', () => {
            expect(getScanner('hello', true, 2).lineFromCursor).toBe('llo');
        });
    });

    describe('#advancePastLine', () => {
        it('should advance past the next LF', () => {
            const scanner = getScanner('hel\nlo', true, 2);
            scanner.advancePastLine();
            expect(scanner.lineFromCursor).toBe('lo');
        });

        it('should advance past the next CR', () => {
            const scanner = getScanner('hel\rlo', true, 2);
            scanner.advancePastLine();
            expect(scanner.lineFromCursor).toBe('lo');
        });

        it('should advance past the next CRLF', () => {
            const scanner = getScanner('hel\r\nlo', true, 2);
            scanner.advancePastLine();
            expect(scanner.lineFromCursor).toBe('lo');
        });
    });

    describe('#advanceTo', () => {
        it('should set the cursor to the supplied value', () => {
            expect(getScanner('hello', true, 0).advanceTo(2).cursor).toBe(2);
        });
    });

    describe('#advanceToToken', () => {
        it('should set the cursor to the supplied value', () => {
            const scanner = getScanner('hello', true, 0);
            const token = scanner.nextCharacterToken;
            expectNonNullToken(token);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(scanner.advanceToToken(token!).cursor).toBe(token!.startCursor);
        });
    });

    describe('#advancePastToken', () => {
        it('should set the cursor to the supplied value', () => {
            const scanner = getScanner('hello', true, 0);
            const token = scanner.nextCharacterToken;
            expectNonNullToken(token);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(scanner.advancePastToken(token!).cursor).toBe(token!.endCursor + 1);
        });
    });

    describe('#truncateToCursor', () => {
        it('should set the cursor to the supplied value', () => {
            const scanner = getScanner('hello', true, 2).truncateToCursor();
            expect(scanner.line).toBe('llo');
            expect(scanner.lineLength).toBe(3);
            expect(scanner.cursor).toBe(0);
        });
    });
});

describe('Token', () => {
    const createToken = (token: string) => {
        return new Token({ token, startCursor: 0, endCursor: 1 });
    };

    describe('.isTokenRowDelimiter', () => {
        it('should return true if the token is a row delimiter', () => {
            expect(Token.isTokenRowDelimiter(createToken('\n'))).toBe(true);
            expect(Token.isTokenRowDelimiter(createToken('\r'))).toBe(true);
            expect(Token.isTokenRowDelimiter(createToken('\r\n'))).toBe(true);
        });
        it('should return false if the token is not a row delimiter', () => {
            expect(Token.isTokenRowDelimiter(createToken('\\n'))).toBe(false);
            expect(Token.isTokenRowDelimiter(createToken('\\r'))).toBe(false);
        });
    });

    describe('#isTokenCarriageReturn', () => {
        it('should return true if the token is a CR delimiter', () => {
            expect(Token.isTokenCarriageReturn(createToken('\r'), createOptions())).toBe(true);
        });
        it('should return false if the token is not a CR delimiter', () => {
            expect(Token.isTokenCarriageReturn(createToken('\n'), createOptions())).toBe(false);
            expect(Token.isTokenCarriageReturn(createToken('\r\n'), createOptions())).toBe(false);
        });
    });

    describe('#isTokenComment', () => {
        it('should return true if the token is a comment character', () => {
            expect(Token.isTokenComment(createToken('#'), createOptions({ comment: '#' }))).toBe(true);
        });

        it('should return false if the token is not a comment character', () => {
            expect(Token.isTokenComment(createToken('+'), createOptions({ comment: '#' }))).toBe(false);
        });

        it('should return false if the token is not a comments are not supported', () => {
            expect(Token.isTokenComment(createToken('#'), createOptions())).toBe(false);
        });
    });

    describe('#isTokenEscapeCharacter', () => {
        it('should return true if the token is an escape character', () => {
            expect(Token.isTokenEscapeCharacter(createToken('\\'), createOptions({ escape: '\\' }))).toBe(true);
        });

        it('should return false if the token is not a escape character', () => {
            expect(Token.isTokenEscapeCharacter(createToken('"'), createOptions({ escape: '\\' }))).toBe(false);
        });
    });

    describe('#isTokenQuote', () => {
        it('should return true if the token is an quote character', () => {
            expect(Token.isTokenEscapeCharacter(createToken('$'), createOptions({ quote: '$' }))).toBe(true);
        });

        it('should return false if the token is not a quote character', () => {
            expect(Token.isTokenEscapeCharacter(createToken('"'), createOptions({ quote: '$' }))).toBe(false);
        });
    });

    describe('#isTokenDelimiter', () => {
        it('should return true if the token is an delimiter character', () => {
            expect(Token.isTokenDelimiter(createToken('\t'), createOptions({ delimiter: '\t' }))).toBe(true);
        });

        it('should return false if the token is not a delimiter character', () => {
            expect(Token.isTokenDelimiter(createToken(','), createOptions({ delimiter: '\t' }))).toBe(false);
        });
    });
});
