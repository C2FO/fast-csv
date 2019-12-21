import { ParserOptionsArgs } from '../../../src';
import { ParserOptions, Scanner, RowParser } from '../../../src/parser';

describe('RowParser', () => {
    const parse = (line: string, hasMoreData = false, parserOpts: ParserOptionsArgs = {}) => {
        const parserOptions = new ParserOptions(parserOpts);
        const rowParser = new RowParser(parserOptions);
        const scanner = new Scanner({ line, parserOptions, hasMoreData });
        return { scanner, row: rowParser.parse(scanner) };
    };

    describe('#parse', () => {
        describe('hasMoreData == true', () => {
            it('should not parse a row that does not have a row delimiter', () => {
                const line = 'first_name,last_name,email_address';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe(line);
                expect(row).toBeNull();
            });

            it('should parse and empty row', () => {
                const line = ',,\n';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['', '', '']);
            });

            it('should parse and empty row with quotes with trailing delimiter', () => {
                const line = '"","","","",\n';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['', '', '', '', '']);
            });

            it('should parse and empty row with quotes without trailing delimiter', () => {
                const line = '"","","",""\n';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['', '', '', '']);
            });

            it('should parse a row that does have a LF', () => {
                const line = 'first_name,last_name,email_address\n';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['first_name', 'last_name', 'email_address']);
            });

            it('should parse a row that has a LF in a quoted column', () => {
                const line = '"first\nname",last_name,email_address\n';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['first\nname', 'last_name', 'email_address']);
            });

            it('should parse a row that has a CR in a quoted column', () => {
                const line = '"first\rname",last_name,email_address\n';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['first\rname', 'last_name', 'email_address']);
            });

            it('should parse a row that has a CRLF in a quoted column', () => {
                const line = '"first\r\nname",last_name,email_address\n';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['first\r\nname', 'last_name', 'email_address']);
            });

            it('should parse a row with a "\\t" delimiter with fields that have spaces', () => {
                const line =
                    '058B        \t09/09/2003\tGL\tARONCA\t58    \t0191006\t1H7\t1          \t  \t  \tA751    \tAERONCA058B\n';
                const { scanner, row } = parse(line, true, { delimiter: '\t' });
                expect(scanner.line).toBe('');
                expect(row).toEqual([
                    '058B        ',
                    '09/09/2003',
                    'GL',
                    'ARONCA',
                    '58    ',
                    '0191006',
                    '1H7',
                    '1          ',
                    '  ',
                    '  ',
                    'A751    ',
                    'AERONCA058B',
                ]);
            });

            it('should parse a row that does have a CR/LF', () => {
                const line = 'first_name,last_name,email_address\r\n';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['first_name', 'last_name', 'email_address']);
            });

            it('should not parse a row that does have a CR but no LF', () => {
                const line = 'first_name,last_name,email_address\r';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe(line);
                expect(row).toBeNull();
            });

            it('should not parse a row that does have a CR but no LF but is followed by more data', () => {
                const line = 'first_name,last_name,email_address\rFirst1';
                const { scanner, row } = parse(line, true);
                expect(scanner.line).toBe('First1');
                expect(row).toEqual(['first_name', 'last_name', 'email_address']);
            });
        });

        describe('hasMoreData == false', () => {
            it('should parse a row that does not have a row delimiter', () => {
                const line = 'first_name,last_name,email_address';
                const { scanner, row } = parse(line, false);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['first_name', 'last_name', 'email_address']);
            });

            it('should parse a row that does have a LF', () => {
                const line = 'first_name,last_name,email_address\n';
                const { scanner, row } = parse(line, false);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['first_name', 'last_name', 'email_address']);
            });

            it('should parse a row that does have a CR/LF', () => {
                const line = 'first_name,last_name,email_address\r\n';
                const { scanner, row } = parse(line, false);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['first_name', 'last_name', 'email_address']);
            });

            it('should parse a row that does have a CR but no LF', () => {
                const line = 'first_name,last_name,email_address\r';
                const { scanner, row } = parse(line, false);
                expect(scanner.line).toBe('');
                expect(row).toEqual(['first_name', 'last_name', 'email_address']);
            });
        });
    });
});
