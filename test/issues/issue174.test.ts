import { EOL } from 'os';
import * as assert from 'assert';
import { ParserOptionsArgs } from '../../src';
import { Parser, ParserOptions } from '../../src/parser';

describe('Issue #174 - https://github.com/C2FO/fast-csv/issues/174', () => {
    const createParser = (parserOptions: ParserOptionsArgs = {}) => new Parser(new ParserOptions(parserOptions));
    const runParser = (data: string, hasMoreData: boolean, parser: Parser) => parser.parse(data, hasMoreData);

    const CSV_CONTENT = ['f1,f2,f3', '1,text, a1', '2,text, a2 '].join(EOL);

    it('skip trailing whitespace after a quoted field', () => {
        const parser = createParser({ headers: true });
        const parsedData = runParser(CSV_CONTENT, false, parser);
        assert.deepStrictEqual(parsedData, {
            line: '',
            rows: [
                ['f1', 'f2', 'f3'],
                ['1', 'text', ' a1'],
                ['2', 'text', ' a2 '],
            ],
        });
    });
});
