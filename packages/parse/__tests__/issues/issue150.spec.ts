import { Parser } from '../../src/parser';
import { ParserOptions } from '../../src/ParserOptions';

describe('Issue #150 - https://github.com/C2FO/fast-csv/issues/150', () => {
    const createParser = (parserOptions = {}) => {
        return new Parser(new ParserOptions(parserOptions));
    };
    const runParser = (data: string, hasMoreData: boolean, parser: Parser) => {
        return parser.parse(data, hasMoreData);
    };

    it('should not parse a row if a new line is a CR and there is more data', () => {
        const data = 'first_name,last_name,email_address\r';
        const myParser = createParser({});
        const parsedData = runParser(data, true, myParser);
        expect(parsedData).toEqual({
            line: 'first_name,last_name,email_address\r',
            rows: [],
        });
    });
});
