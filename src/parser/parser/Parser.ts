import { Scanner, Token } from './Scanner';
import RowParser from './RowParser';
import { ParserOptions } from '../ParserOptions';
import { RowArray } from '../types';

const EMPTY_ROW_REGEXP = /^\s*(?:''|"")?\s*(?:,\s*(?:''|"")?\s*)*$/;

export interface ParseResult {
    line: string;
    rows: string[][];
}
export default class Parser {
    private static removeBOM(line: string): string {
        // Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
        // conversion translates it to FEFF (UTF-16 BOM)
        if (line && line.charCodeAt(0) === 0xFEFF) {
            return line.slice(1);
        }
        return line;
    }

    private readonly parserOptions: ParserOptions;

    private readonly rowParser: RowParser;

    public constructor(parserOptions: ParserOptions) {
        this.parserOptions = parserOptions;
        this.rowParser = new RowParser(this.parserOptions);
    }

    public parse(line: string, hasMoreData: boolean): ParseResult {
        const scanner = new Scanner({
            line: Parser.removeBOM(line),
            parserOptions: this.parserOptions,
            hasMoreData,
        });
        if (this.parserOptions.supportsComments) {
            return this.parseWithComments(scanner);
        }
        return this.parseWithoutComments(scanner);
    }

    private parseWithoutComments(scanner: Scanner): ParseResult {
        const rows: RowArray[] = [];
        let shouldContinue = true;
        while (shouldContinue) {
            shouldContinue = this.parseRow(scanner, rows);
        }
        return { line: scanner.line, rows };
    }

    private parseWithComments(scanner: Scanner): ParseResult {
        const { parserOptions } = this;
        const rows: RowArray[] = [];
        for (let nextToken = scanner.nextCharacterToken; nextToken !== null; nextToken = scanner.nextCharacterToken) {
            if (Token.isTokenComment(nextToken, parserOptions)) {
                const cursor = scanner.advancePastLine();
                if (cursor === null) {
                    return { line: scanner.lineFromCursor, rows };
                }
                if (!scanner.hasMoreCharacters) {
                    return { line: scanner.lineFromCursor, rows };
                }
                scanner.truncateToCursor();
            } else if (!this.parseRow(scanner, rows)) {
                break;
            }
        }
        return { line: scanner.line, rows };
    }

    private parseRow(scanner: Scanner, rows: RowArray[]): boolean {
        const nextToken = scanner.nextNonSpaceToken;
        if (!nextToken) {
            return false;
        }
        const row = this.rowParser.parse(scanner);
        if (row === null) {
            return false;
        }
        if (this.parserOptions.ignoreEmpty && EMPTY_ROW_REGEXP.test(row.join(''))) {
            return true;
        }
        rows.push(row);
        return true;
    }
}
