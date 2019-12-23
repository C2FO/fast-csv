import * as sinon from 'sinon';
import { ParserOptions } from '../../../src/ParserOptions';
import { ColumnParser } from '../../../src/parser/column';
import { Scanner } from '../../../src/parser';

describe('ColumnParser', () => {
    describe('#parse', () => {
        describe('with un-quoted data', () => {
            it('should call the nonQuotedColumnParser', () => {
                const line = 'HELLO';
                const parserOptions = new ParserOptions({});
                const lineParser = new ColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                const expectedResult = { scanner, items: [] };
                const mock = sinon.mock(lineParser.nonQuotedColumnParser);
                mock.expects('parse')
                    .once()
                    .withArgs(scanner)
                    .returns(expectedResult);
                expect(lineParser.parse(scanner)).toEqual(expectedResult);
                mock.verify();
            });
        });
        describe('with quoted data', () => {
            it('should call the quotedColumnParser', () => {
                const line = '"HELLO"';
                const parserOptions = new ParserOptions({});
                const lineParser = new ColumnParser(parserOptions);
                const scanner = new Scanner({ line, parserOptions, hasMoreData: true });
                const expectedResult = { scanner, items: [] };
                const mock = sinon.mock(lineParser.quotedColumnParser);
                mock.expects('parse')
                    .once()
                    .withArgs(scanner)
                    .returns(expectedResult);
                expect(lineParser.parse(scanner)).toEqual(expectedResult);
                mock.verify();
            });
        });
    });
});
