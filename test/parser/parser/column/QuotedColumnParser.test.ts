import * as assert from 'assert';
import { ParserOptions, ParserOptionsArgs } from '../../../../src/parser';
import { QuotedColumnParser } from '../../../../src/parser/parser/column';
import { Scanner } from '../../../../src/parser/parser/Scanner';

describe('QuotedColumnParser', () => {
    const parse = (
        line: string,
        hasMoreData = false,
        parserOpts: ParserOptionsArgs = { }
    ) => {
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
                assert.strictEqual(lineParser.parse(scanner), null);
                assert.strictEqual(scanner, scanner);
            });

            it('should parse a quoted col when not followed by any characters', () => {
                const line = '"hello"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '');
            });


            it('should not parse a quoted col when not followed by any characters', () => {
                const line = '"hello,';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, null);
                assert.strictEqual(scanner.lineFromCursor, '"hello,');
            });

            it('should parse a quoted col up to a column delimiter', () => {
                const line = '"hello","world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, ',"world"');
            });

            it('should parse a quoted col up to a column delimiter with a LF in the column', () => {
                const line = '"hel\nlo","world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hel\nlo');
                assert.strictEqual(scanner.lineFromCursor, ',"world"');
            });

            it('should parse a quoted col up to a column delimiter with a CR in the column', () => {
                const line = '"hel\rlo","world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hel\rlo');
                assert.strictEqual(scanner.lineFromCursor, ',"world"');
            });

            it('should parse a quoted col up to a column delimiter with a CRLF in the column', () => {
                const line = '"hel\r\nlo","world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hel\r\nlo');
                assert.strictEqual(scanner.lineFromCursor, ',"world"');
            });


            it('should parse a quoted col up to a LF', () => {
                const line = '"hello"\n"world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\n"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r"world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r\n"world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r\n"world"');
            });

            it('should parse a quoted column with escaped quotes when not followed by any characters', () => {
                const line = '"hell""o"""';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should parse a quoted column with escaped quotes when followed by a delimiter', () => {
                const line = '"hell""o""","world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, ',"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a LF', () => {
                const line = '"hell""o"""\n"world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\n"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CR', () => {
                const line = '"hell""o"""\r"world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\r"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CRLF', () => {
                const line = '"hell""o"""\r\n"world"';
                const { scanner, col } = parse(line, true);
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\r\n"world"');
            });

            it('should include all white space up to a column delimiter', () => {
                const line = '"    "\t"    "';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, '    ');
                assert.strictEqual(scanner.lineFromCursor, '\t"    "');
            });


            it('should throw an error if a column contains a closing quote that is not followed by a row or column delimiter', () => {
                const line = '"hello\n"First';
                assert.throws(() => parse(line, true), /Parse Error: expected: ',' OR new line got: 'F'. at 'First/);
                assert.throws(() => parse(line, false), /Parse Error: expected: ',' OR new line got: 'F'. at 'First/);
            });

            describe('hasMoreData is true', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell""o';
                    const { scanner, col } = parse(line, true);
                    assert.strictEqual(col, null);
                    assert.strictEqual(scanner.lineFromCursor, line);
                });
            });

            describe('hasMoreData is false', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell""o';
                    assert.throws(() => parse(line, false), /Parse Error: missing closing: '"' in line: at '"hell""o'/);
                });
            });
        });

        describe('with non-default delimiter', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({ delimiter: '\t' });
                const lineParser = new QuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                assert.strictEqual(lineParser.parse(scanner), null);
                assert.strictEqual(scanner, scanner);
            });

            it('should parse a quoted col when not followed by any characters', () => {
                const line = '"hello"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should parse a quoted col up to a column delimiter', () => {
                const line = '"hello"\t"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\t"world"');
            });

            it('should parse a quoted col up to a LF', () => {
                const line = '"hello"\n"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\n"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r\n"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r\n"world"');
            });

            it('should parse a quoted column with escaped quotes when not followed by any characters', () => {
                const line = '"hell""o"""';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should parse a quoted column with escaped quotes when followed by a delimiter', () => {
                const line = '"hell""o"""\t"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\t"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a LF', () => {
                const line = '"hell""o"""\n"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\n"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CR', () => {
                const line = '"hell""o"""\r"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\r"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CRLF', () => {
                const line = '"hell""o"""\r\n"world"';
                const { scanner, col } = parse(line, true, { delimiter: '\t' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\r\n"world"');
            });


            it('should throw an error if a column contains a closing quote that is not followed by a row or column delimiter', () => {
                const line = '"hello\n"First';
                assert.throws(() => parse(line, true, { delimiter: '\t' }), /Parse Error: expected: '\t' OR new line got: 'F'. at 'First/);
                assert.throws(() => parse(line, false, { delimiter: '\t' }), /Parse Error: expected: '\t' OR new line got: 'F'. at 'First/);
            });

            describe('hasMoreData is true', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell""o';
                    const { scanner, col } = parse(line, true, { delimiter: '\t' });
                    assert.strictEqual(col, null);
                    assert.strictEqual(scanner.lineFromCursor, line);
                });
            });

            describe('hasMoreData is false', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell""o';
                    assert.throws(() => parse(line, false, { delimiter: '\t' }), /Parse Error: missing closing: '"' in line: at '"hell""o'/);
                });
            });
        });

        describe('with non-default quote', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({ quote: '$' });
                const lineParser = new QuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                assert.strictEqual(lineParser.parse(scanner), null);
                assert.strictEqual(scanner, scanner);
            });

            it('should parse a quoted col when not followed by any characters', () => {
                const line = '$hello$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should parse a quoted col up to a column delimiter', () => {
                const line = '$hello$,$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, ',$world$');
            });

            it('should parse a quoted col up to a LF', () => {
                const line = '$hello$\n$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\n$world$');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '$hello$\r$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r$world$');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '$hello$\r\n$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r\n$world$');
            });

            it('should parse a quoted column with escaped quotes when not followed by any characters', () => {
                const line = '$hell$$o$$$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hell$o$');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should parse a quoted column with escaped quotes when followed by a delimiter', () => {
                const line = '$hell$$o$$$,$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hell$o$');
                assert.strictEqual(scanner.lineFromCursor, ',$world$');
            });

            it('should parse a quoted column with escaped quotes when followed by a LF', () => {
                const line = '$hell$$o$$$\n$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hell$o$');
                assert.strictEqual(scanner.lineFromCursor, '\n$world$');
            });

            it('should parse a quoted column with escaped quotes when followed by a CR', () => {
                const line = '$hell$$o$$$\r$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hell$o$');
                assert.strictEqual(scanner.lineFromCursor, '\r$world$');
            });

            it('should parse a quoted column with escaped quotes when followed by a CRLF', () => {
                const line = '$hell$$o$$$\r\n$world$';
                const { scanner, col } = parse(line, true, { quote: '$' });
                assert.strictEqual(col, 'hell$o$');
                assert.strictEqual(scanner.lineFromCursor, '\r\n$world$');
            });


            it('should throw an error if a column contains a closing quote that is not followed by a row or column delimiter', () => {
                const line = '$hello\n$First';
                assert.throws(() => parse(line, true, { quote: '$' }), /Parse Error: expected: ',' OR new line got: 'F'. at 'First/);
                assert.throws(() => parse(line, false, { quote: '$' }), /Parse Error: expected: ',' OR new line got: 'F'. at 'First/);
            });

            describe('hasMoreData is true', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '$hell$$o';
                    const { scanner, col } = parse(line, true, { quote: '$' });
                    assert.strictEqual(col, null);
                    assert.strictEqual(scanner.lineFromCursor, line);
                });
            });

            describe('hasMoreData is false', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '$hell$$o';
                    assert.throws(() => parse(line, false, { quote: '$' }), /Parse Error: missing closing: '\$' in line: at '\$hell\$\$o'/);
                });
            });
        });

        describe('with non-default escape', () => {
            it('should return the same scanner if there is no data', () => {
                const line = '';
                const parserOptions = new ParserOptions({ escape: '$' });
                const lineParser = new QuotedColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                assert.strictEqual(lineParser.parse(scanner), null);
                assert.strictEqual(scanner, scanner);
            });

            it('should parse a quoted col when not followed by any characters', () => {
                const line = '"hello"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should parse a quoted col up to a column delimiter', () => {
                const line = '"hello","world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, ',"world"');
            });

            it('should parse an escape not followed by a quote', () => {
                const line = '"hell$o","world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hell$o');
                assert.strictEqual(scanner.lineFromCursor, ',"world"');
            });


            it('should parse a quoted col up to a LF', () => {
                const line = '"hello"\n"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\n"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r"world"');
            });

            it('should parse a quoted col up to a CR', () => {
                const line = '"hello"\r\n"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '\r\n"world"');
            });

            it('should parse a quoted column with escaped quotes when not followed by any characters', () => {
                const line = '"hell$"o$""';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should parse a quoted column with escaped quotes when followed by a delimiter', () => {
                const line = '"hell$"o$"","world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, ',"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a LF', () => {
                const line = '"hell$"o$""\n"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\n"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CR', () => {
                const line = '"hell$"o$""\r"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\r"world"');
            });

            it('should parse a quoted column with escaped quotes when followed by a CRLF', () => {
                const line = '"hell$"o$""\r\n"world"';
                const { scanner, col } = parse(line, true, { escape: '$' });
                assert.strictEqual(col, 'hell"o"');
                assert.strictEqual(scanner.lineFromCursor, '\r\n"world"');
            });


            it('should throw an error if a column contains a closing quote that is not followed by a row or column delimiter', () => {
                const line = '"hello\n"First';
                assert.throws(() => parse(line, true, { escape: '$' }), /Parse Error: expected: ',' OR new line got: 'F'. at 'First/);
                assert.throws(() => parse(line, false, { escape: '$' }), /Parse Error: expected: ',' OR new line got: 'F'. at 'First/);
            });

            describe('hasMoreData is true', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell$"o';
                    const { scanner, col } = parse(line, true, { escape: '$' });
                    assert.strictEqual(col, null);
                    assert.strictEqual(scanner.lineFromCursor, line);
                });
            });

            describe('hasMoreData is false', () => {
                it('should not parse a column without a closing quote', () => {
                    const line = '"hell$"o';
                    assert.throws(() => parse(line, false, { escape: '$' }), /Parse Error: missing closing: '"' in line: at '"hell\$"o'/);
                });
            });
        });

        describe('trim options', () => {
            it('should trim the item', () => {
                const line = '"   hello   "';
                const { scanner, col } = parse(line, true, { trim: true });
                assert.strictEqual(col, 'hello');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should ltrim the item', () => {
                const line = '"   hello   "';
                const { scanner, col } = parse(line, true, { ltrim: true });
                assert.strictEqual(col, 'hello   ');
                assert.strictEqual(scanner.lineFromCursor, '');
            });

            it('should rtrim the item', () => {
                const line = '"   hello   "';
                const { scanner, col } = parse(line, true, { rtrim: true });
                assert.strictEqual(col, '   hello');
                assert.strictEqual(scanner.lineFromCursor, '');
            });
        });
    });
});
