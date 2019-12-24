import { EOL } from 'os';
import { Parser } from '../../src/parser';
import { ParserOptions } from '../../src/ParserOptions';

describe('Issue #223 - https://github.com/C2FO/fast-csv/issues/223', () => {
    const createParser = (parserOptions = {}) => new Parser(new ParserOptions(parserOptions));
    const runParser = (data: string, hasMoreData: boolean, parser: Parser) => parser.parse(data, hasMoreData);

    it('skip trailing whitespace after a quoted field', () => {
        const CSV_CONTENT = ['"ABC"   ,"DEFG"  ,12345,"HI"', '"JKLM"  ,"NOP"   ,67890,"QR"   '].join(EOL);
        const parser = createParser();
        const parsedData = runParser(CSV_CONTENT, false, parser);
        expect(parsedData).toEqual({
            line: '',
            rows: [
                ['ABC', 'DEFG', '12345', 'HI'],
                ['JKLM', 'NOP', '67890', 'QR'],
            ],
        });
    });
});
