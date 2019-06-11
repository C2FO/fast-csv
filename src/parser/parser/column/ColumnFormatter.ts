import { ParserOptions } from '../../ParserOptions';

export default class ColumnFormatter {
    public readonly format: (col: string) => string;

    public constructor(parserOptions: ParserOptions) {
        if (parserOptions.trim) {
            this.format = (col: string): string => col.trim();
        } else if (parserOptions.ltrim) {
            this.format = (col: string): string => col.trimLeft();
        } else if (parserOptions.rtrim) {
            this.format = (col: string): string => col.trimRight();
        } else {
            this.format = (col: string): string => col;
        }
    }
}
