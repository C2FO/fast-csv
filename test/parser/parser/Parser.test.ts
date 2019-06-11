import * as assert from 'assert';
import { ParserOptions, ParserOptionsArgs } from '../../../src/parser';
import { Parser } from '../../../src/parser/parser';

describe('Parser', () => {
    const createParser = (parserOptions: ParserOptionsArgs = {}) => new Parser(new ParserOptions(parserOptions));

    const parse = (data: string, hasMoreData: boolean, parser: Parser) => parser.parse(data, hasMoreData);

    it('should parse a block of CSV text that starts with a BOM', () => {
        const data = '\ufefffirst_name,last_name,email_address';
        const myParser = createParser({ delimiter: ',' });
        assert.deepStrictEqual(parse(data, false, myParser), {
            line: '',
            rows: [
                [ 'first_name', 'last_name', 'email_address' ],
            ],
        });
    });

    describe('with \\n', () => {
        describe('unescaped data', () => {
            it('should parse a block of CSV text', () => {
                const data = 'first_name,last_name,email_address\nFirst1,Last1,email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First1', 'Last1', 'email1@email.com' ],
                    ],
                });
            });

            it('should ignore empty rows if ignoreEmpty is true', () => {
                const data = 'first_name,last_name,email_address\nFirst1,Last1,email1@email.com\n,,';
                const myParser = createParser({ delimiter: ',', ignoreEmpty: true });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First1', 'Last1', 'email1@email.com' ],
                    ],
                });
            });

            it('should not ignore empty rows if ignoreEmpty is false', () => {
                const data = 'first_name,last_name,email_address\nFirst1,Last1,email1@email.com\n,,';
                const myParser = createParser({ delimiter: ',', ignoreEmpty: false });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First1', 'Last1', 'email1@email.com' ],
                        [ '', '', '' ],
                    ],
                });
            });

            it('should parse a block of CSV text with a trailing delimiter', () => {
                const data = 'first_name,last_name,email_address,empty\nFirst1,Last1,email1@email.com,\n';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', '' ],
                    ],
                });
            });

            it('should parse a block of CSV text with a trailing delimiter and no new line', () => {
                const data = 'first_name,last_name,email_address,empty\nFirst1,Last1,email1@email.com,';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', '' ],
                    ],
                });
            });

            it('should parse a block of CSV text with a trailing delimiter followed by a space', () => {
                const data = 'first_name,last_name,email_address,empty\nFirst1,Last1,email1@email.com, \n';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', ' ' ],
                    ],
                });
            });

            it('should parse a block of Space Separated Value text with a trailing delimiter', () => {
                const data = 'first_name last_name email_address empty\nFirst1 Last1 email1@email.com \n';
                const myParser = createParser({ delimiter: ' ' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', '' ],
                    ],
                });
            });

            it('should return the rest of the line if there is more data', () => {
                const data = 'first_name,last_name,email_address\nFirst1,Last1,email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, true, myParser), {
                    line: 'First1,Last1,email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });

            it('should accept new data and return the result', () => {
                const data = 'first_name,last_name,email_address\nFirst1,Last1,email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'First1,Last1,email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
                assert.deepStrictEqual(parse(`${parsedData.line}\nFirst2,Last2,email2@email.com`, false, myParser), {
                    line: '',
                    rows: [
                        [ 'First1', 'Last1', 'email1@email.com' ],
                        [ 'First2', 'Last2', 'email2@email.com' ],
                    ],
                });
            });

            it('should not parse a row if a new line is not found and there is more data', () => {
                const data = 'first_name,last_name,email_address';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'first_name,last_name,email_address',
                    rows: [],
                });
            });

            it('should not parse a row if there is a trailing delimiter and there is more data', () => {
                const data = 'first_name,last_name,email_address,';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'first_name,last_name,email_address,',
                    rows: [],
                });
            });

            it('should not parse a row if there is a trailing delimiter with a space, and there is more data', () => {
                const data = 'first_name,last_name,email_address, ';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'first_name,last_name,email_address, ',
                    rows: [],
                });
            });

            it('should parse a row if a new line is found and there is more data', () => {
                const data = 'first_name,last_name,email_address\n';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });
        });

        describe('escaped values', () => {
            it('should parse a block of CSV text', () => {
                const data = 'first_name,last_name,email_address\n"First,1","Last,1","email1@email.com"';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First,1', 'Last,1', 'email1@email.com' ],
                    ],
                });
            });

            it('should parse a block of CSV text with a trailing delimiter', () => {
                const data = 'first_name,last_name,email_address,empty\nFirst1,Last1,email1@email.com,\n';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', '' ],
                    ],
                });
            });

            it('should parse a block of CSV text with a trailing delimiter followed by a space', () => {
                const data = 'first_name,last_name,email_address,empty\nFirst1,Last1,email1@email.com, \n';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', ' ' ],
                    ],
                });
            });

            it('should parse a block of Space Separated Value text with a trailing delimiter', () => {
                const data = 'first_name last_name email_address empty\nFirst1 Last1 email1@email.com \n';
                const myParser = createParser({ delimiter: ' ' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', '' ],
                    ],
                });
            });

            it('should parse a block of CSV text with escaped escaped char', () => {
                const data = 'first_name,last_name,email_address\n"First,""1""","Last,""1""","email1@email.com"';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First,"1"', 'Last,"1"', 'email1@email.com' ],
                    ],
                });
            });

            it('should parse a block of CSV text with alternate escape char', () => {
                const data = 'first_name,last_name,email_address\n"First,\\"1\\"","Last,\\"1\\"","email1@email.com"';
                const myParser = createParser({ delimiter: ',', escape: '\\' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First,"1"', 'Last,"1"', 'email1@email.com' ],
                    ],
                });
            });

            it('should return the rest of the line if a complete value is not found', () => {
                const data = 'first_name,last_name,email_address\n"First,""1""","Last,""1""","email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, true, myParser), {
                    line: '"First,""1""","Last,""1""","email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });

            it('should accept more data appended to the returned line with escaped values', () => {
                const data = 'first_name,last_name,email_address\n"First,""1""","Last,""1""","email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"First,""1""","Last,""1""","email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
                assert.deepStrictEqual(parse(`${parsedData.line}"\n"First,""2""","Last,""2""","email2@email.com"`, false, myParser), {
                    line: '',
                    rows: [
                        [ 'First,"1"', 'Last,"1"', 'email1@email.com' ],
                        [ 'First,"2"', 'Last,"2"', 'email2@email.com' ],
                    ],
                });
            });

            it('should throw an error if there is not more data and there is an invalid escape sequence', () => {
                const data = 'first_name,last_name,email_address\n"First,""1""","Last,""1""","email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"First,""1""","Last,""1""","email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
                assert.throws(() => {
                    myParser.parse(`${parsedData.line}\n"First,"",2""","Last""2""","email2@email.com"`, false);
                }, /Parse Error: expected: ',' OR new line got: 'F'. at 'First,"",2/);
            });

            it('should handle empty values properly', () => {
                const data = '"","",""\n,Last4,email4@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, false, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '',
                    rows: [
                        [ '', '', '' ],
                        [ '', 'Last4', 'email4@email.com' ],
                    ],
                });
            });

            it('should not parse a row if a new line is not found and there is more data', () => {
                const data = '"first_name","last_name","email_address"';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"first_name","last_name","email_address"',
                    rows: [],
                });
            });

            it('should not parse a row if there is a trailing delimiter and there is more data', () => {
                const data = '"first_name","last_name","email_address",';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"first_name","last_name","email_address",',
                    rows: [],
                });
            });

            it('should parse a row if a new line is found and there is more data', () => {
                const data = '"first_name","last_name","email_address"\n';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });
        });

        describe('null quote', () => {
            it('should ignore escaping if quote is null', () => {
                const data = 'first_name,last_name,email_address\n"First1","Last1","email1@email.com"';
                const myParser = createParser({ delimiter: ',', quote: null });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ '"First1"', '"Last1"', '"email1@email.com"' ],
                    ],
                });
            });
        });
    });

    describe('with \\r', () => {
        describe('unescaped data', () => {
            it('should parse a block of CSV text', () => {
                const data = 'first_name,last_name,email_address\rFirst1,Last1,email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First1', 'Last1', 'email1@email.com' ],
                    ],
                });
            });

            it('should parse a block of CSV text with a trailing delimiter', () => {
                const data = 'first_name,last_name,email_address,empty\rFirst1,Last1,email1@email.com,\r';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', '' ],
                    ],
                });
            });

            it('should parse a block of CSV text with a trailing delimiter followed by a space', () => {
                const data = 'first_name,last_name,email_address,empty\nFirst1,Last1,email1@email.com, \r';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', ' ' ],
                    ],
                });
            });

            it('should parse a block of Space Separated Value text with a trailing delimiter', () => {
                const data = 'first_name last_name email_address empty\rFirst1 Last1 email1@email.com \r';
                const myParser = createParser({ delimiter: ' ' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address', 'empty' ],
                        [ 'First1', 'Last1', 'email1@email.com', '' ],
                    ],
                });
            });

            it('should return the rest of the line if there is more data', () => {
                const data = 'first_name,last_name,email_address\rFirst1,Last1,email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, true, myParser), {
                    line: 'First1,Last1,email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });

            it('should accept new data and return the result', () => {
                const data = 'first_name,last_name,email_address\rFirst1,Last1,email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'First1,Last1,email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
                assert.deepStrictEqual(parse(`${parsedData.line}\rFirst2,Last2,email2@email.com`, false, myParser), {
                    line: '',
                    rows: [
                        [ 'First1', 'Last1', 'email1@email.com' ],
                        [ 'First2', 'Last2', 'email2@email.com' ],
                    ],
                });
            });

            it('should not parse a row if a new line is not found and there is more data', () => {
                const data = 'first_name,last_name,email_address';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'first_name,last_name,email_address',
                    rows: [],
                });
            });

            it('should not parse a row if there is a trailing delimiter and there is more data', () => {
                const data = 'first_name,last_name,email_address,';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'first_name,last_name,email_address,',
                    rows: [],
                });
            });

            it('should not parse a row if an ambiguous new line is found and there is more data', () => {
                const data = 'first_name,last_name,email_address\r';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'first_name,last_name,email_address\r',
                    rows: [],
                });
            });
        });

        describe('escaped values', () => {
            it('should parse a block of CSV text', () => {
                const data = 'first_name,last_name,email_address\r"First,1","Last,1","email1@email.com"';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First,1', 'Last,1', 'email1@email.com' ],
                    ],
                });
            });

            it('should parse a block of CSV text with escaped escaped char', () => {
                const data = 'first_name,last_name,email_address\r"First,""1""","Last,""1""","email1@email.com"';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First,"1"', 'Last,"1"', 'email1@email.com' ],
                    ],
                });
            });

            it('should parse a block of CSV text with alternate escape char', () => {
                const data = 'first_name,last_name,email_address\r"First,\\"1\\"","Last,\\"1\\"","email1@email.com"';
                const myParser = createParser({ delimiter: ',', escape: '\\' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First,"1"', 'Last,"1"', 'email1@email.com' ],
                    ],
                });
            });

            it('should return the rest of the line if a complete value is not found', () => {
                const data = 'first_name,last_name,email_address\r"First,""1""","Last,""1""","email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, true, myParser), {
                    line: '"First,""1""","Last,""1""","email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });

            it('should accept more data appended to the returned line with escaped values', () => {
                const data = 'first_name,last_name,email_address\r"First,""1""","Last,""1""","email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"First,""1""","Last,""1""","email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
                assert.deepStrictEqual(parse(`${parsedData.line}"\r"First,""2""","Last,""2""","email2@email.com"`, false, myParser), {
                    line: '',
                    rows: [
                        [ 'First,"1"', 'Last,"1"', 'email1@email.com' ],
                        [ 'First,"2"', 'Last,"2"', 'email2@email.com' ],
                    ],
                });
            });

            it('should throw an error if there is not more data and there is an invalid escape sequence', () => {
                const data = 'first_name,last_name,email_address\r"First,""1""","Last,""1""","email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"First,""1""","Last,""1""","email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
                assert.throws(() => {
                    myParser.parse(`${parsedData.line}\r"First,"",2""","Last""2""","email2@email.com"`, false);
                }, /Parse Error: expected: ',' OR new line got: 'F'. at 'First,"",2/);
            });

            it('should handle empty values properly', () => {
                const data = '"","",""\r,Last4,email4@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, false, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '',
                    rows: [
                        [ '', '', '' ],
                        [ '', 'Last4', 'email4@email.com' ],
                    ],
                });
            });

            it('should not parse a row if a new line is not found and there is more data', () => {
                const data = '"first_name","last_name","email_address"';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"first_name","last_name","email_address"',
                    rows: [],
                });
            });

            it('should not parse a row if there is a trailing delimiter and there is more data', () => {
                const data = '"first_name","last_name","email_address",';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"first_name","last_name","email_address",',
                    rows: [],
                });
            });

            it('should not parse a row if an ambiguous new line is found and there is more data', () => {
                const data = '"first_name","last_name","email_address"\r';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"first_name","last_name","email_address"\r',
                    rows: [],
                });
            });
        });

        describe('null quote', () => {
            it('should ignore escaping if quote is null', () => {
                const data = 'first_name,last_name,email_address\r"First1","Last1","email1@email.com"';
                const myParser = createParser({ delimiter: ',', quote: null });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ '"First1"', '"Last1"', '"email1@email.com"' ],
                    ],
                });
            });
        });
    });

    describe('with \\r\\n', () => {
        describe('unescaped data', () => {
            it('should parse a block of CSV text', () => {
                const data = 'first_name,last_name,email_address\r\nFirst1,Last1,email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First1', 'Last1', 'email1@email.com' ],
                    ],
                });
            });

            it('should return the rest of the line if there is more data', () => {
                const data = 'first_name,last_name,email_address\r\nFirst1,Last1,email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, true, myParser), {
                    line: 'First1,Last1,email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });

            it('should accept new data and return the result', () => {
                const data = 'first_name,last_name,email_address\r\nFirst1,Last1,email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'First1,Last1,email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
                assert.deepStrictEqual(parse(`${parsedData.line}\r\nFirst2,Last2,email2@email.com`, false, myParser), {
                    line: '',
                    rows: [
                        [ 'First1', 'Last1', 'email1@email.com' ],
                        [ 'First2', 'Last2', 'email2@email.com' ],
                    ],
                });
            });

            it('should not parse a row if a new line is not found and there is more data', () => {
                const data = 'first_name,last_name,email_address';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'first_name,last_name,email_address',
                    rows: [],
                });
            });

            it('should not parse a row if a new line is incomplete and there is more data', () => {
                const data = 'first_name,last_name,email_address\r';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'first_name,last_name,email_address\r',
                    rows: [],
                });
            });

            it('should not parse a row if there is a trailing delimiter and there is more data', () => {
                const data = 'first_name,last_name,email_address,';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: 'first_name,last_name,email_address,',
                    rows: [],
                });
            });

            it('should parse a row if a new line is found and there is more data', () => {
                const data = 'first_name,last_name,email_address\r\n';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });
        });

        describe('escaped values', () => {
            it('should parse a block of CSV text', () => {
                const data = 'first_name,last_name,email_address\r\n"First,1","Last,1","email1@email.com"';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First,1', 'Last,1', 'email1@email.com' ],
                    ],
                });
            });

            it('should parse a block of CSV text with escaped escaped char', () => {
                const data = 'first_name,last_name,email_address\r\n"First,""1""","Last,""1""","email1@email.com"';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First,"1"', 'Last,"1"', 'email1@email.com' ],
                    ],
                });
            });

            it('should parse a block of CSV text with alternate escape char', () => {
                const data = 'first_name,last_name,email_address\r\n"First,\\"1\\"","Last,\\"1\\"","email1@email.com"';
                const myParser = createParser({ delimiter: ',', escape: '\\' });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ 'First,"1"', 'Last,"1"', 'email1@email.com' ],
                    ],
                });
            });

            it('should return the rest of the line if a complete value is not found', () => {
                const data = 'first_name,last_name,email_address\r\n"First,""1""","Last,""1""","email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                assert.deepStrictEqual(parse(data, true, myParser), {
                    line: '"First,""1""","Last,""1""","email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });

            it('should accept more data appended to the returned line with escaped values', () => {
                const data = 'first_name,last_name,email_address\r\n"First,""1""","Last,""1""","email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"First,""1""","Last,""1""","email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
                assert.deepStrictEqual(parse(`${parsedData.line}"\r\n"First,""2""","Last,""2""","email2@email.com"`, false, myParser), {
                    line: '',
                    rows: [
                        [ 'First,"1"', 'Last,"1"', 'email1@email.com' ],
                        [ 'First,"2"', 'Last,"2"', 'email2@email.com' ],
                    ],
                });
            });

            it('should throw an error if there is not more data and there is an invalid escape sequence', () => {
                const data = 'first_name,last_name,email_address\r\n"First,""1""","Last,""1""","email1@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"First,""1""","Last,""1""","email1@email.com',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
                assert.throws(() => {
                    myParser.parse(`${parsedData.line}\r\n"First,"",2""","Last""2""","email2@email.com"`, false);
                }, /Parse Error: expected: ',' OR new line got: 'F'. at 'First,"",2/);
            });

            it('should handle empty values properly', () => {
                const data = '"","",""\r\n,Last4,email4@email.com';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, false, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '',
                    rows: [
                        [ '', '', '' ],
                        [ '', 'Last4', 'email4@email.com' ],
                    ],
                });
            });

            it('should not parse a row if a new line is not found and there is more data', () => {
                const data = '"first_name","last_name","email_address"';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"first_name","last_name","email_address"',
                    rows: [],
                });
            });

            it('should not parse a row if there is a trailing delimiter and there is more data', () => {
                const data = '"first_name","last_name","email_address",';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '"first_name","last_name","email_address",',
                    rows: [],
                });
            });

            it('should parse a row if a new line is found and there is more data', () => {
                const data = '"first_name","last_name","email_address"\r\n';
                const myParser = createParser({ delimiter: ',' });
                const parsedData = parse(data, true, myParser);
                assert.deepStrictEqual(parsedData, {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                    ],
                });
            });
        });

        describe('null quote', () => {
            it('should ignore escaping if quote is null', () => {
                const data = 'first_name,last_name,email_address\r\n"First1","Last1","email1@email.com"';
                const myParser = createParser({ delimiter: ',', quote: null });
                assert.deepStrictEqual(parse(data, false, myParser), {
                    line: '',
                    rows: [
                        [ 'first_name', 'last_name', 'email_address' ],
                        [ '"First1"', '"Last1"', '"email1@email.com"' ],
                    ],
                });
            });
        });
    });

    describe('with comments', () => {
        it('should parse a block of CSV text', () => {
            const data = 'first_name,last_name,email_address\n#The first row of data\nFirst1,Last1,email1@email.com';
            const myParser = createParser({ delimiter: ',', comment: '#' });
            assert.deepStrictEqual(parse(data, false, myParser), {
                line: '',
                rows: [
                    [ 'first_name', 'last_name', 'email_address' ],
                    [ 'First1', 'Last1', 'email1@email.com' ],
                ],
            });
        });

        it('should return the rest of the line if there is more data', () => {
            const data = 'first_name,last_name,email_address\n#First1,Last1,email1@email.com';
            const myParser = createParser({ delimiter: ',', comment: '#' });
            assert.deepStrictEqual(parse(data, true, myParser), {
                line: '#First1,Last1,email1@email.com',
                rows: [
                    [ 'first_name', 'last_name', 'email_address' ],
                ],
            });
        });

        it('should accept new data and return the result', () => {
            const data = 'first_name,last_name,email_address\n#This is a comment';
            const myParser = createParser({ delimiter: ',', comment: '#' });
            const parsedData = parse(data, true, myParser);
            assert.deepStrictEqual(parsedData, {
                line: '#This is a comment',
                rows: [
                    [ 'first_name', 'last_name', 'email_address' ],
                ],
            });
            assert.deepStrictEqual(parse(`${parsedData.line}\nFirst1,Last1,email1@email.com\nFirst2,Last2,email2@email.com`, false, myParser), {
                line: '',
                rows: [
                    [ 'First1', 'Last1', 'email1@email.com' ],
                    [ 'First2', 'Last2', 'email2@email.com' ],
                ],
            });
        });

        it('should not parse a row if a new line is not found and there is more data', () => {
            const data = '#first_name,last_name,email_address';
            const myParser = createParser({ delimiter: ',', comment: '#' });
            const parsedData = parse(data, true, myParser);
            assert.deepStrictEqual(parsedData, {
                line: '#first_name,last_name,email_address',
                rows: [],
            });
        });

        it('should not parse data as a comment if it is contained in a line', () => {
            const data = 'f#irst_name,last_name,email_address';
            const myParser = createParser({ delimiter: ',', comment: '#' });
            const parsedData = parse(data, false, myParser);
            assert.deepStrictEqual(parsedData, {
                line: '',
                rows: [ [ 'f#irst_name', 'last_name', 'email_address' ] ],
            });
        });

        it('should not parse data as a comment if it at the beginning but escaped', () => {
            const data = '"#first_name",last_name,email_address';
            const myParser = createParser({ delimiter: ',', comment: '#' });
            const parsedData = parse(data, false, myParser);
            assert.deepStrictEqual(parsedData, {
                line: '',
                rows: [ [ '#first_name', 'last_name', 'email_address' ] ],
            });
        });

        it('should return empty rows if it is all comments as there is no more data and there is not a final row delimiter', () => {
            const data = '#Comment1\n#Comment2';
            const myParser = createParser({ delimiter: ',', comment: '#' });
            const parsedData = parse(data, false, myParser);
            assert.deepStrictEqual(parsedData, {
                line: '',
                rows: [],
            });
        });

        it('should return empty rows if it is all comments as there is no more data and there is a final row delimiter', () => {
            const data = '#Comment1\n#Comment2\n';
            const myParser = createParser({ delimiter: ',', comment: '#' });
            const parsedData = parse(data, false, myParser);
            assert.deepStrictEqual(parsedData, {
                line: '',
                rows: [],
            });
        });
    });
});
