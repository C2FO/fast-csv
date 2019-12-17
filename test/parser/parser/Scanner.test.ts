import * as assert from 'assert';
import { ParserOptionsArgs } from '../../../src';
import { ParserOptions, Scanner, Token, MaybeToken } from '../../../src/parser';

const createOptions = (opts: ParserOptionsArgs = {}) => new ParserOptions(opts);
describe('Scanner', () => {
    const getScanner = (line: string, hasMoreData: boolean, cursor = 0, parserOpts: ParserOptionsArgs = {}) =>
        new Scanner({
            line,
            parserOptions: createOptions(parserOpts),
            hasMoreData,
            cursor,
        });

    const assertToken = (token: MaybeToken): token is Token => {
        if (token === null) {
            assert.fail('Expected non-null token');
        }
        return true;
    };

    const assertTokenContent = (token: MaybeToken, content: string): void => {
        if (assertToken(token)) {
            assert.strictEqual(token.token, content);
        }
    };

    describe('#hasMoreCharacters', () => {
        it('should return true if the cursor is not past the end of the line', () => {
            assert.strictEqual(getScanner('hello', true).hasMoreCharacters, true);
        });

        it('should return true if the cursor is not past the end of the line', () => {
            assert.strictEqual(getScanner('hello', true, 5).hasMoreCharacters, false);
        });
    });

    describe('#nextNonSpaceToken', () => {
        it('should get non space token in the line', () => {
            assertTokenContent(getScanner(' h', true, 0).nextNonSpaceToken, 'h');
        });

        it('should get the LF in the line', () => {
            assertTokenContent(getScanner(' \n', true, 0).nextNonSpaceToken, '\n');
        });

        it('should get the CR in the line', () => {
            assertTokenContent(getScanner(' \r', true, 0).nextNonSpaceToken, '\r');
        });

        it('should get the CRLF in the line', () => {
            assertTokenContent(getScanner(' \r\n', true, 0).nextNonSpaceToken, '\r\n');
        });

        it('should return null if there is nothing but white space', () => {
            assert.strictEqual(getScanner('    \t', true, 0).nextNonSpaceToken, null);
        });

        it('should return a token the delimiter is a space token', () => {
            assertTokenContent(getScanner('   \t', true, 0, { delimiter: '\t' }).nextNonSpaceToken, '\t');
        });
    });

    describe('#nextCharacterToken', () => {
        it('should get the next character in the line', () => {
            assertTokenContent(getScanner('h', true, 0).nextCharacterToken, 'h');
        });

        it('should get the next character in the line if it it whitespace', () => {
            assertTokenContent(getScanner(' h', true, 0).nextCharacterToken, ' ');
        });

        it('should return null if the cursor is at the end of the line', () => {
            assert.strictEqual(getScanner('hello', true, 5).nextCharacterToken, null);
        });
    });

    describe('#line from cursor', () => {
        it('should return the line from the current cursor', () => {
            assert.strictEqual(getScanner('hello', true, 2).lineFromCursor, 'llo');
        });
    });

    describe('#advancePastLine', () => {
        it('should advance past the next LF', () => {
            const scanner = getScanner('hel\nlo', true, 2);
            scanner.advancePastLine();
            assert.strictEqual(scanner.lineFromCursor, 'lo');
        });

        it('should advance past the next CR', () => {
            const scanner = getScanner('hel\rlo', true, 2);
            scanner.advancePastLine();
            assert.strictEqual(scanner.lineFromCursor, 'lo');
        });

        it('should advance past the next CRLF', () => {
            const scanner = getScanner('hel\r\nlo', true, 2);
            scanner.advancePastLine();
            assert.strictEqual(scanner.lineFromCursor, 'lo');
        });
    });

    describe('#advancePastLine', () => {
        it('should advance past the next LF', () => {
            const scanner = getScanner('hel\nlo', true, 2);
            scanner.advancePastLine();
            assert.strictEqual(scanner.lineFromCursor, 'lo');
        });

        it('should advance past the next CR', () => {
            const scanner = getScanner('hel\rlo', true, 2);
            scanner.advancePastLine();
            assert.strictEqual(scanner.lineFromCursor, 'lo');
        });

        it('should advance past the next CRLF', () => {
            const scanner = getScanner('hel\r\nlo', true, 2);
            scanner.advancePastLine();
            assert.strictEqual(scanner.lineFromCursor, 'lo');
        });
    });

    describe('#advanceTo', () => {
        it('should set the cursor to the supplied value', () => {
            assert.strictEqual(getScanner('hello', true, 0).advanceTo(2).cursor, 2);
        });
    });

    describe('#advanceToToken', () => {
        it('should set the cursor to the supplied value', () => {
            const scanner = getScanner('hello', true, 0);
            const token = scanner.nextCharacterToken;
            if (assertToken(token)) {
                assert.strictEqual(scanner.advanceToToken(token).cursor, token.startCursor);
            }
        });
    });

    describe('#advancePastToken', () => {
        it('should set the cursor to the supplied value', () => {
            const scanner = getScanner('hello', true, 0);
            const token = scanner.nextCharacterToken;
            if (assertToken(token)) {
                assert.strictEqual(scanner.advancePastToken(token).cursor, token.endCursor + 1);
            }
        });
    });

    describe('#truncateToCursor', () => {
        it('should set the cursor to the supplied value', () => {
            const scanner = getScanner('hello', true, 2).truncateToCursor();
            assert.strictEqual(scanner.line, 'llo');
            assert.strictEqual(scanner.lineLength, 3);
            assert.strictEqual(scanner.cursor, 0);
        });
    });
});

describe('Token', () => {
    const createToken = (token: string) => new Token({ token, startCursor: 0, endCursor: 1 });

    describe('.isTokenRowDelimiter', () => {
        it('should return true if the token is a row delimiter', () => {
            assert.strictEqual(Token.isTokenRowDelimiter(createToken('\n')), true);
            assert.strictEqual(Token.isTokenRowDelimiter(createToken('\r')), true);
            assert.strictEqual(Token.isTokenRowDelimiter(createToken('\r\n')), true);
        });
        it('should return false if the token is not a row delimiter', () => {
            assert.strictEqual(Token.isTokenRowDelimiter(createToken('\\n')), false);
            assert.strictEqual(Token.isTokenRowDelimiter(createToken('\\r')), false);
        });
    });

    describe('#isTokenCarriageReturn', () => {
        it('should return true if the token is a CR delimiter', () => {
            assert.strictEqual(Token.isTokenCarriageReturn(createToken('\r'), createOptions()), true);
        });
        it('should return false if the token is not a CR delimiter', () => {
            assert.strictEqual(Token.isTokenCarriageReturn(createToken('\n'), createOptions()), false);
            assert.strictEqual(Token.isTokenCarriageReturn(createToken('\r\n'), createOptions()), false);
        });
    });

    describe('#isTokenComment', () => {
        it('should return true if the token is a comment character', () => {
            assert.strictEqual(Token.isTokenComment(createToken('#'), createOptions({ comment: '#' })), true);
        });

        it('should return false if the token is not a comment character', () => {
            assert.strictEqual(Token.isTokenComment(createToken('+'), createOptions({ comment: '#' })), false);
        });

        it('should return false if the token is not a comments are not supported', () => {
            assert.strictEqual(Token.isTokenComment(createToken('#'), createOptions()), false);
        });
    });

    describe('#isTokenEscapeCharacter', () => {
        it('should return true if the token is an escape character', () => {
            assert.strictEqual(Token.isTokenEscapeCharacter(createToken('\\'), createOptions({ escape: '\\' })), true);
        });

        it('should return false if the token is not a escape character', () => {
            assert.strictEqual(Token.isTokenEscapeCharacter(createToken('"'), createOptions({ escape: '\\' })), false);
        });
    });

    describe('#isTokenQuote', () => {
        it('should return true if the token is an quote character', () => {
            assert.strictEqual(Token.isTokenEscapeCharacter(createToken('$'), createOptions({ quote: '$' })), true);
        });

        it('should return false if the token is not a quote character', () => {
            assert.strictEqual(Token.isTokenEscapeCharacter(createToken('"'), createOptions({ quote: '$' })), false);
        });
    });

    describe('#isTokenDelimiter', () => {
        it('should return true if the token is an delimiter character', () => {
            assert.strictEqual(Token.isTokenDelimiter(createToken('\t'), createOptions({ delimiter: '\t' })), true);
        });

        it('should return false if the token is not a delimiter character', () => {
            assert.strictEqual(Token.isTokenDelimiter(createToken(','), createOptions({ delimiter: '\t' })), false);
        });
    });
});
