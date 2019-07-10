import { EOL } from 'os';
import * as assert from 'assert';
import { Parser } from '../../src/parser/parser';
import { ParserOptions } from '../../src/parser';


describe('Issue #223 - https://github.com/C2FO/fast-csv/issues/223', () => {
    const createParser = (parserOptions = {}) => new Parser(new ParserOptions(parserOptions));
    const runParser = (data: string, hasMoreData: boolean, parser: Parser) => parser.parse(data, hasMoreData);

    it('skip trailing whitespace after a quoted field', () => {
        const CSV_CONTENT = [
            '"ABC"   ,"DEFG"  ,12345,"HI"',
            '"JKLM"  ,"NOP"   ,67890,"QR"   ',
        ].join(EOL);
        const parser = createParser();
        const parsedData = runParser(CSV_CONTENT, false, parser);
        assert.deepStrictEqual(parsedData, {
            line: '',
            rows: [
                [ 'ABC', 'DEFG', '12345', 'HI' ],
                [ 'JKLM', 'NOP', '67890', 'QR' ],
            ],
        });
    });
});
