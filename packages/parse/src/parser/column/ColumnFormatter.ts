import { ParserOptions } from '../../ParserOptions';

export class ColumnFormatter {
    public readonly format: (col: string) => string;

    public constructor(parserOptions: ParserOptions) {
        if (parserOptions.trim) {
            this.format = (col: string): string => {
                return col.trim();
            };
        } else if (parserOptions.ltrim) {
            this.format = (col: string): string => {
                return col.trimLeft();
            };
        } else if (parserOptions.rtrim) {
            this.format = (col: string): string => {
                return col.trimRight();
            };
        } else {
            this.format = (col: string): string => {
                return col;
            };
        }
    }
}
