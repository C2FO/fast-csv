import { EOL } from 'os';
import { ParserOptionsArgs } from '../../src';
import { Parser } from '../../src/parser';
import { ParserOptions } from '../../src/ParserOptions';

describe('Issue #174 - https://github.com/C2FO/fast-csv/issues/174', () => {
    const createParser = (parserOptions: ParserOptionsArgs = {}) => {
        return new Parser(new ParserOptions(parserOptions));
    };
    const runParser = (data: string, hasMoreData: boolean, parser: Parser) => {
        return parser.parse(data, hasMoreData);
    };

    const CSV_CONTENT = ['f1,f2,f3', '1,text, a1', '2,text, a2 '].join(EOL);

    it('skip trailing whitespace after a quoted field', () => {
        const parser = createParser({ headers: true });
        const parsedData = runParser(CSV_CONTENT, false, parser);
        expect(parsedData).toEqual({
            line: '',
            rows: [
                ['f1', 'f2', 'f3'],
                ['1', 'text', ' a1'],
                ['2', 'text', ' a2 '],
            ],
        });
    });
});
