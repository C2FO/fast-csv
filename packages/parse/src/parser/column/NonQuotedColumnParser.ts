import { ParserOptions } from '../../ParserOptions';
import { ColumnFormatter } from './ColumnFormatter';
import { Scanner } from '../Scanner';
import { Token } from '../Token';

export class NonQuotedColumnParser {
    private readonly parserOptions: ParserOptions;

    private readonly columnFormatter: ColumnFormatter;

    public constructor(parserOptions: ParserOptions) {
        this.parserOptions = parserOptions;
        this.columnFormatter = new ColumnFormatter(parserOptions);
    }

    public parse(scanner: Scanner): string | null {
        if (!scanner.hasMoreCharacters) {
            return null;
        }
        const { parserOptions } = this;
        const characters = [];
        let nextToken = scanner.nextCharacterToken;
        for (; nextToken; nextToken = scanner.nextCharacterToken) {
            if (Token.isTokenDelimiter(nextToken, parserOptions) || Token.isTokenRowDelimiter(nextToken)) {
                break;
            }
            characters.push(nextToken.token);
            scanner.advancePastToken(nextToken);
        }
        return this.columnFormatter.format(characters.join(''));
    }
}
