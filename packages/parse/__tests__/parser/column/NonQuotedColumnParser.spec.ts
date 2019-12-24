import { ParserOptionsArgs } from '../../../src';
import { ParserOptions } from '../../../src/ParserOptions';
import { NonQuotedColumnParser } from '../../../src/parser/column';
import { Scanner } from '../../../src/parser';

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
                expect(lineParser.parse(scanner)).toBeNull();
            });

            it('should parse a column up to a column delimiter', () => {
                const line = 'hello,world';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe(',world');
            });

            it('should parse a column when not followed by any characters', () => {
                const line = 'hello';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should parse a column up to a LF', () => {
                const line = 'hello\nworld';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\nworld');
            });

            it('should parse a column up to a CR', () => {
                const line = 'hello\rworld';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\rworld');
            });

            it('should parse a column up to a CRLF', () => {
                const line = 'hello\r\nworld';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r\nworld');
            });

            describe('trim options', () => {
                it('should trim the item', () => {
                    const line = '   hello   ';
                    const { scanner, col } = parse(line, true, { trim: true });
                    expect(col).toBe('hello');
                    expect(scanner.lineFromCursor).toBe('');
                });

                it('should ltrim the item', () => {
                    const line = '   hello   ';
                    const { scanner, col } = parse(line, true, { ltrim: true });
                    expect(col).toBe('hello   ');
                    expect(scanner.lineFromCursor).toBe('');
                });

                it('should rtrim the item', () => {
                    const line = '   hello   ';
                    const { scanner, col } = parse(line, true, { rtrim: true });
                    expect(col).toBe('   hello');
                    expect(scanner.lineFromCursor).toBe('');
                });
            });
        });

        describe('with non-default delimiter', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({ delimiter: '\t' });
                const lineParser = new NonQuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                expect(lineParser.parse(scanner)).toBeNull();
                expect(scanner).toBe(scanner);
            });

            it('should parse a column when not followed by any characters', () => {
                const line = 'hello';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should parse a column up to the column delimiter', () => {
                const line = 'hello\tworld';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\tworld');
            });

            it('should include all white space up to a column delimiter', () => {
                const line = '    \t    ';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('    ');
                expect(scanner.lineFromCursor).toBe('\t    ');
            });

            it('should parse a column up to a LF', () => {
                const line = 'hello\nworld';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\nworld');
            });

            it('should parse a column up to a CR', () => {
                const line = 'hello\rworld';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\rworld');
            });

            it('should parse a column up to a CRLF', () => {
                const line = 'hello\r\nworld';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r\nworld');
            });

            describe('trim options', () => {
                it('should trim white space from both ends when trim is true', () => {
                    const line = '   hello   \t';
                    const { scanner, col } = parse(line, true, { delimiter: '\t', trim: true });
                    expect(col).toBe('hello');
                    expect(scanner.lineFromCursor).toBe('\t');
                });

                it('should trim white space from the left when ltrim is true', () => {
                    const line = '   hello   \t';
                    const { scanner, col } = parse(line, true, { delimiter: '\t', ltrim: true });
                    expect(col).toBe('hello   ');
                    expect(scanner.lineFromCursor).toBe('\t');
                });

                it('should trim white space from the right when rtrim is true', () => {
                    const line = '   hello   \t';
                    const { scanner, col } = parse(line, true, { delimiter: '\t', ltrim: true });
                    expect(col).toBe('hello   ');
                    expect(scanner.lineFromCursor).toBe('\t');
                });
            });
        });
    });
});
