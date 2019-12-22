import { ParserOptions, Parser } from '../../src/parser';

describe('Issue #111 - https://github.com/C2FO/fast-csv/issues/111', () => {
    const createParser = (parserOptions = {}) => new Parser(new ParserOptions(parserOptions));
    const runParser = (data: string, hasMoreData: boolean, parser: Parser) => parser.parse(data, hasMoreData);

    it('should parse a block of CSV text with a trailing delimiter', () => {
        const data = 'first_name,last_name,email_address,empty\nFirst1,Last1,email1@email.com,\n';
        const myParser = createParser({ delimiter: ',' });
        expect(runParser(data, false, myParser)).toEqual({
            line: '',
            rows: [
                ['first_name', 'last_name', 'email_address', 'empty'],
                ['First1', 'Last1', 'email1@email.com', ''],
            ],
        });
    });

    it('should parse a block of CSV text with a delimiter at file end', () => {
        const data = 'first_name,last_name,email_address,empty\nFirst1,Last1,email1@email.com,';
        const myParser = createParser({ delimiter: ',' });
        expect(runParser(data, false, myParser)).toEqual({
            line: '',
            rows: [
                ['first_name', 'last_name', 'email_address', 'empty'],
                ['First1', 'Last1', 'email1@email.com', ''],
            ],
        });
    });

    it('should parse a block of CSV text with two delimiters at file end', () => {
        const data = 'first_name,last_name,email_address,empty1,empty2\nFirst1,Last1,email1@email.com,,';
        const myParser = createParser({ delimiter: ',' });
        expect(runParser(data, false, myParser)).toEqual({
            line: '',
            rows: [
                ['first_name', 'last_name', 'email_address', 'empty1', 'empty2'],
                ['First1', 'Last1', 'email1@email.com', '', ''],
            ],
        });
    });

    it('should parse a block of CSV text with a trailing delimiter followed by a space', () => {
        const data = 'first_name,last_name,email_address,empty\nFirst1,Last1,email1@email.com, \n';
        const myParser = createParser({ delimiter: ',' });
        expect(runParser(data, false, myParser)).toEqual({
            line: '',
            rows: [
                ['first_name', 'last_name', 'email_address', 'empty'],
                ['First1', 'Last1', 'email1@email.com', ' '],
            ],
        });
    });

    it('should parse a block of Space Separated Value text with a trailing delimiter', () => {
        const data = 'first_name last_name email_address empty\nFirst1 Last1 email1@email.com \n';
        const myParser = createParser({ delimiter: ' ' });
        expect(runParser(data, false, myParser)).toEqual({
            line: '',
            rows: [
                ['first_name', 'last_name', 'email_address', 'empty'],
                ['First1', 'Last1', 'email1@email.com', ''],
            ],
        });
    });

    it('should parse a block of Space Separated Values with two delimiters at file end', () => {
        const data = 'first_name last_name email_address empty empty2\nFirst1 Last1 email1@email.com  \n';
        const myParser = createParser({ delimiter: ' ' });
        expect(runParser(data, false, myParser)).toEqual({
            line: '',
            rows: [
                ['first_name', 'last_name', 'email_address', 'empty', 'empty2'],
                ['First1', 'Last1', 'email1@email.com', '', ''],
            ],
        });
    });
});
