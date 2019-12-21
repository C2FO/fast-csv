import { ParserOptionsArgs } from '../../../../src';
import { ParserOptions, QuotedColumnParser, Scanner } from '../../../../src/parser';

describe('QuotedColumnParser', () => {
    const parse = (line: string, hasMoreData = false, parserOpts: ParserOptionsArgs = {}) => {
        const parserOptions = new ParserOptions(parserOpts);
        const columnParser = new QuotedColumnParser(parserOptions);
        const scanner = new Scanner({ line, parserOptions, hasMoreData });
        return { scanner, col: columnParser.parse(scanner) };
    };

    describe('#parse', () => {
        describe('with default delimiter', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({});
                const lineParser = new QuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                expect(lineParser.parse(scanner)).toBe(null);
                expect(scanner).toBe(scanner);
            });

            it('should parse a quoted col when not followed by any characters', () => {
                const line = '"hello"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should not parse a quoted col when not followed by any characters', () => {
                const line = '"hello,';
                const { scanner, col } = parse(line, true);
                expect(col).toBe(null);
                expect(scanner.lineFromCursor).toBe('"hello,');
            });

            it('should parse a quoted col up to a column delimiter', () => {
                const line = '"hello","world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe(',"world"');
            });

            it('should parse a quoted col up to a column delimiter with a LF in the column', () => {
                const line = '"hel\nlo","world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hel\nlo');
                expect(scanner.lineFromCursor).toBe(',"world"');
            });

            it('should parse a quoted col up to a column delimiter with a CR in the column', () => {
                const line = '"hel\rlo","world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hel\rlo');
                expect(scanner.lineFromCursor).toBe(',"world"');
            });

            it('should parse a quoted col up to a column delimiter with a CRLF in the column', () => {
                const line = '"hel\r\nlo","world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hel\r\nlo');
                expect(scanner.lineFromCursor).toBe(',"world"');
            });

            it('should parse a quoted col up to a LF', () => {
                const line = '"hello"\n"world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\n"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r"world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r\n"world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r\n"world"');
            });

            it('should parse a quoted column with escaped quotes when not followed by any characters', () => {
                const line = '"hell""o"""';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should parse a quoted column with escaped quotes when followed by a delimiter', () => {
                const line = '"hell""o""","world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe(',"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a LF', () => {
                const line = '"hell""o"""\n"world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\n"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CR', () => {
                const line = '"hell""o"""\r"world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\r"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CRLF', () => {
                const line = '"hell""o"""\r\n"world"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\r\n"world"');
            });

            it('should skip white space after a quote up to the column delimiter', () => {
                const line = '"Hello"    ,"World"';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe(',"World"');
            });

            it('should skip white space after a quote up to a LF', () => {
                const line = '"Hello"    \n';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe('\n');
            });

            it('should skip white space after a quote up to a CR', () => {
                const line = '"Hello"    \r';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe('\r');
            });

            it('should skip white space after a quote up to a CRLF', () => {
                const line = '"Hello"    \r\n';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe('\r\n');
            });

            it('should skip white space after a quote if has more data is false and there is no new line', () => {
                const line = '"Hello"    ';
                const { scanner, col } = parse(line, false);
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should include all quoted white space up to a column delimiter', () => {
                const line = '"    ","    "';
                const { scanner, col } = parse(line, true);
                expect(col).toBe('    ');
                expect(scanner.lineFromCursor).toBe(',"    "');
            });

            it('should throw an error if a column contains a closing quote that is not followed by a row or column delimiter', () => {
                const line = '"hello\n"First';
                expect(() => parse(line, true)).toThrowError(
                    /Parse Error: expected: ',' OR new line got: 'F'. at 'First/,
                );
                expect(() => parse(line, false)).toThrowError(
                    /Parse Error: expected: ',' OR new line got: 'F'. at 'First/,
                );
            });

            describe('hasMoreData is true', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell""o';
                    const { scanner, col } = parse(line, true);
                    expect(col).toBe(null);
                    expect(scanner.lineFromCursor).toBe(line);
                });
            });

            describe('hasMoreData is false', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell""o';
                    expect(() => parse(line, false)).toThrowError(
                        /Parse Error: missing closing: '"' in line: at '"hell""o'/,
                    );
                });
            });
        });

        describe('with non-default delimiter', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({ delimiter: '\t' });
                const lineParser = new QuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                expect(lineParser.parse(scanner)).toBe(null);
                expect(scanner).toBe(scanner);
            });

            it('should parse a quoted col when not followed by any characters', () => {
                const line = '"hello"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should parse a quoted col up to a column delimiter', () => {
                const line = '"hello"\t"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\t"world"');
            });

            it('should parse a quoted col up to a LF', () => {
                const line = '"hello"\n"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\n"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r\n"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r\n"world"');
            });

            it('should parse a quoted column with escaped quotes when not followed by any characters', () => {
                const line = '"hell""o"""';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should parse a quoted column with escaped quotes when followed by a delimiter', () => {
                const line = '"hell""o"""\t"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\t"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a LF', () => {
                const line = '"hell""o"""\n"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\n"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CR', () => {
                const line = '"hell""o"""\r"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\r"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CRLF', () => {
                const line = '"hell""o"""\r\n"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\r\n"world"');
            });

            it('should skip white space after a quote up to the column delimiter', () => {
                const line = '"Hello"    \t"World"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe('\t"World"');
            });

            it('should skip white space after a quote up to a LF', () => {
                const line = '"Hello"    \n';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe('\n');
            });

            it('should skip white space after a quote up to a CR', () => {
                const line = '"Hello"    \r';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe('\r');
            });

            it('should skip white space after a quote up to a CRLF', () => {
                const line = '"Hello"    \r\n';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe('\r\n');
            });

            it('should skip white space after a quote if has more data is false and there is no new line', () => {
                const line = '"Hello"    ';
                const { scanner, col } = parse(line, false, { delimiter: '\t' });
                expect(col).toBe('Hello');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should include all quoted white space up to a column delimiter', () => {
                const line = '"    "\t"    "';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                expect(col).toBe('    ');
                expect(scanner.lineFromCursor).toBe('\t"    "');
            });

            it('should throw an error if a column contains a closing quote that is not followed by a row or column delimiter', () => {
                const line = '"hello\n"First';
                expect(() => parse(line, true, { delimiter: '\t' })).toThrowError(
                    /Parse Error: expected: '\t' OR new line got: 'F'. at 'First/,
                );
                expect(() => parse(line, false, { delimiter: '\t' })).toThrowError(
                    /Parse Error: expected: '\t' OR new line got: 'F'. at 'First/,
                );
            });

            describe('hasMoreData is true', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell""o';
                    const { scanner, col } = parse(line, true, { delimiter: '\t' });
                    expect(col).toBe(null);
                    expect(scanner.lineFromCursor).toBe(line);
                });
            });

            describe('hasMoreData is false', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell""o';
                    expect(() => parse(line, false, { delimiter: '\t' })).toThrowError(
                        /Parse Error: missing closing: '"' in line: at '"hell""o'/,
                    );
                });
            });
        });

        describe('with non-default quote', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({ quote: '$' });
                const lineParser = new QuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                expect(lineParser.parse(scanner)).toBe(null);
                expect(scanner).toBe(scanner);
            });

            it('should parse a quoted col when not followed by any characters', () => {
                const line = '$hello$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should parse a quoted col up to a column delimiter', () => {
                const line = '$hello$,$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe(',$world$');
            });

            it('should parse a quoted col up to a LF', () => {
                const line = '$hello$\n$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\n$world$');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '$hello$\r$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r$world$');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '$hello$\r\n$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r\n$world$');
            });

            it('should parse a quoted column with escaped quotes when not followed by any characters', () => {
                const line = '$hell$$o$$$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hell$o$');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should parse a quoted column with escaped quotes when followed by a delimiter', () => {
                const line = '$hell$$o$$$,$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hell$o$');
                expect(scanner.lineFromCursor).toBe(',$world$');
            });

            it('should parse a quoted column with escaped quotes when followed by a LF', () => {
                const line = '$hell$$o$$$\n$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hell$o$');
                expect(scanner.lineFromCursor).toBe('\n$world$');
            });

            it('should parse a quoted column with escaped quotes when followed by a CR', () => {
                const line = '$hell$$o$$$\r$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hell$o$');
                expect(scanner.lineFromCursor).toBe('\r$world$');
            });

            it('should parse a quoted column with escaped quotes when followed by a CRLF', () => {
                const line = '$hell$$o$$$\r\n$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                expect(col).toBe('hell$o$');
                expect(scanner.lineFromCursor).toBe('\r\n$world$');
            });

            it('should throw an error if a column contains a closing quote that is not followed by a row or column delimiter', () => {
                const line = '$hello\n$First';
                expect(() => parse(line, true, { quote: '$' })).toThrowError(
                    /Parse Error: expected: ',' OR new line got: 'F'. at 'First/,
                );
                expect(() => parse(line, false, { quote: '$' })).toThrowError(
                    /Parse Error: expected: ',' OR new line got: 'F'. at 'First/,
                );
            });

            describe('hasMoreData is true', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '$hell$$o';
                    const { scanner, col } = parse(line, true, { quote: '$' });
                    expect(col).toBe(null);
                    expect(scanner.lineFromCursor).toBe(line);
                });
            });

            describe('hasMoreData is false', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '$hell$$o';
                    expect(() => parse(line, false, { quote: '$' })).toThrowError(
                        /Parse Error: missing closing: '\$' in line: at '\$hell\$\$o'/,
                    );
                });
            });
        });

        describe('with non-default escape', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({ escape: '$' });
                const lineParser = new QuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                expect(lineParser.parse(scanner)).toBe(null);
                expect(scanner).toBe(scanner);
            });

            it('should parse a quoted col when not followed by any characters', () => {
                const line = '"hello"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should parse a quoted col up to a column delimiter', () => {
                const line = '"hello","world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe(',"world"');
            });

            it('should parse an escape not followed by a quote', () => {
                const line = '"hell$o","world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hell$o');
                expect(scanner.lineFromCursor).toBe(',"world"');
            });

            it('should parse a quoted col up to a LF', () => {
                const line = '"hello"\n"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\n"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r\n"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('\r\n"world"');
            });

            it('should parse a quoted column with escaped quotes when not followed by any characters', () => {
                const line = '"hell$"o$""';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should parse a quoted column with escaped quotes when followed by a delimiter', () => {
                const line = '"hell$"o$"","world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe(',"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a LF', () => {
                const line = '"hell$"o$""\n"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\n"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CR', () => {
                const line = '"hell$"o$""\r"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\r"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CRLF', () => {
                const line = '"hell$"o$""\r\n"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                expect(col).toBe('hell"o"');
                expect(scanner.lineFromCursor).toBe('\r\n"world"');
            });

            it('should throw an error if a column contains a closing quote that is not followed by a row or column delimiter', () => {
                const line = '"hello\n"First';
                expect(() => parse(line, true, { escape: '$' })).toThrowError(
                    /Parse Error: expected: ',' OR new line got: 'F'. at 'First/,
                );
                expect(() => parse(line, false, { escape: '$' })).toThrowError(
                    /Parse Error: expected: ',' OR new line got: 'F'. at 'First/,
                );
            });

            describe('hasMoreData is true', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell$"o';
                    const { scanner, col } = parse(line, true, { escape: '$' });
                    expect(col).toBe(null);
                    expect(scanner.lineFromCursor).toBe(line);
                });
            });

            describe('hasMoreData is false', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell$"o';
                    expect(() => parse(line, false, { escape: '$' })).toThrowError(
                        /Parse Error: missing closing: '"' in line: at '"hell\$"o'/,
                    );
                });
            });
        });

        describe('trim options', () => {
            it('should trim the item', () => {
                const line = '"   hello   "';
                const { scanner, col } = parse(line, true, { trim: true });
                expect(col).toBe('hello');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should ltrim the item', () => {
                const line = '"   hello   "';
                const { scanner, col } = parse(line, true, { ltrim: true });
                expect(col).toBe('hello   ');
                expect(scanner.lineFromCursor).toBe('');
            });

            it('should rtrim the item', () => {
                const line = '"   hello   "';
                const { scanner, col } = parse(line, true, { rtrim: true });
                expect(col).toBe('   hello');
                expect(scanner.lineFromCursor).toBe('');
            });
        });
    });
});
