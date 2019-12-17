import * as assert from 'assert';
import { ParserOptionsArgs } from '../../../../src';
import { ParserOptions, Scanner, NonQuotedColumnParser } from '../../../../src/parser';

describe('NonQuotedColumnParser', () => {
    const parse = (line: string, hasMoreData = false, parserOpts: ParserOptionsArgs = {}) => {
        const parserOptions = new ParserOptions(parserOpts);
        const columnParser = new NonQuotedColumnParser(parserOptions);
        const scanner = new Scanner({ line, parserOptions, hasMoreData });
        return { scanner, col: columnParser.parse(scanner) };
    };

    describe('#parse', () => {
        describe('with default delimiter', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({});
                const lineParser = new NonQuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                assert.strictEqual(lineParser.parse(scanner), null);
            });

            it('should parse a column up to a column delimiter', () => {
                const line = 'hello,world';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, ',world');
            });

            it('should parse a column when not followed by any characters', () => {
                const line = 'hello';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should parse a column up to a LF', () => {
                const line = 'hello\nworld';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\nworld');
            });

            it('should parse a column up to a CR', () => {
                const line = 'hello\rworld';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\rworld');
            });

            it('should parse a column up to a CRLF', () => {
                const line = 'hello\r\nworld';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r\nworld');
            });

            describe('trim options', () => {
                it('should trim the item', () => {
                    const line = '   hello   ';
                    const { scanner, col } = parse(line, true, { trim: true });
                    assert.strictEqual(col, 'hello');
                    assert.strictEqual(scanner.lineFromCursor, '');
                });

                it('should ltrim the item', () => {
                    const line = '   hello   ';
                    const { scanner, col } = parse(line, true, { ltrim: true });
                    assert.strictEqual(col, 'hello   ');
                    assert.strictEqual(scanner.lineFromCursor, '');
                });

                it('should rtrim the item', () => {
                    const line = '   hello   ';
                    const { scanner, col } = parse(line, true, { rtrim: true });
                    assert.strictEqual(col, '   hello');
                    assert.strictEqual(scanner.lineFromCursor, '');
                });
            });
        });

        describe('with non-default delimiter', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({ delimiter: '\t' });
                const lineParser = new NonQuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                assert.strictEqual(lineParser.parse(scanner), null);
                assert.strictEqual(scanner, scanner);
            });

            it('should parse a column when not followed by any characters', () => {
                const line = 'hello';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should parse a column up to the column delimiter', () => {
                const line = 'hello\tworld';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\tworld');
            });

            it('should include all white space up to a column delimiter', () => {
                const line = '    \t    ';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, '    ');
                assert.strictEqual(scanner.lineFromCursor, '\t    ');
            });

            it('should parse a column up to a LF', () => {
                const line = 'hello\nworld';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\nworld');
            });

            it('should parse a column up to a CR', () => {
                const line = 'hello\rworld';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\rworld');
            });

            it('should parse a column up to a CRLF', () => {
                const line = 'hello\r\nworld';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r\nworld');
            });

            describe('trim options', () => {
                it('should trim white space from both ends when trim is true', () => {
                    const line = '   hello   \t';
                    const { scanner, col } = parse(line, true, { delimiter: '\t', trim: true });
                    assert.strictEqual(col, 'hello');
                    assert.strictEqual(scanner.lineFromCursor, '\t');
                });

                it('should trim white space from the left when ltrim is true', () => {
                    const line = '   hello   \t';
                    const { scanner, col } = parse(line, true, { delimiter: '\t', ltrim: true });
                    assert.strictEqual(col, 'hello   ');
                    assert.strictEqual(scanner.lineFromCursor, '\t');
                });

                it('should trim white space from the right when rtrim is true', () => {
                    const line = '   hello   \t';
                    const { scanner, col } = parse(line, true, { delimiter: '\t', ltrim: true });
                    assert.strictEqual(col, 'hello   ');
                    assert.strictEqual(scanner.lineFromCursor, '\t');
                });
            });
        });
    });
});
