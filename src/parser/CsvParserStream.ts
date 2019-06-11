import { NodeStringDecoder, StringDecoder } from 'string_decoder';
import { Transform, TransformCallback } from 'stream';
import { ParserOptions } from './ParserOptions';
import { HeaderTransformer, RowTransformerValidator } from './transforms';
import { Parser } from './parser';
import {
    RowArray,
    RowTransformFunction, RowValidate, RowValidatorCallback,
} from './types';

export default class CsvParserStream extends Transform {
    private readonly parserOptions: ParserOptions;

    private readonly decoder: NodeStringDecoder = new StringDecoder();

    private readonly parser: Parser;

    private readonly headerTransformer: HeaderTransformer;

    private readonly rowTransformerValidator: RowTransformerValidator;

    private lines: string = '';

    private rowCount: number = 0;

    private endEmitted: boolean = false;


    public constructor(parserOptions: ParserOptions) {
        super({ objectMode: parserOptions.objectMode });
        this.parserOptions = parserOptions;
        this.parser = new Parser(parserOptions);
        this.headerTransformer = new HeaderTransformer(parserOptions);
        this.rowTransformerValidator = new RowTransformerValidator();
    }

    public transform(transformFunction: RowTransformFunction): CsvParserStream {
        this.rowTransformerValidator.rowTransform = transformFunction;
        return this;
    }

    public validate(validateFunction: RowValidate): CsvParserStream {
        this.rowTransformerValidator.rowValidator = validateFunction;
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public emit(event: string | symbol, ...rest: any[]): boolean {
        if (event === 'end') {
            if (!this.endEmitted) {
                this.endEmitted = true;
                super.emit('end', this.rowCount);
            }
            return false;
        }
        return super.emit(event, ...rest);
    }

    public _transform(data: Buffer, encoding: string, done: TransformCallback): void {
        try {
            const { lines } = this;
            const newLine = (lines + this.decoder.write(data));
            const rows = this.parse(newLine, true);
            this.processRows(rows, done);
        } catch (e) {
            done(e);
        }
    }


    public _flush(done: TransformCallback): void {
        try {
            const rows = this.parse(this.lines, false);
            this.processRows(rows, done);
        } catch (e) {
            done(e);
        }
    }

    private parse(data: string, hasMoreData: boolean): string[][] {
        if (!data) {
            return [];
        }
        const { line, rows } = this.parser.parse(data, hasMoreData);
        this.lines = line;
        return rows;
    }

    private processRows(rows: string[][], cb: TransformCallback): void {
        const rowsLength = rows.length;
        const iterate = (i: number): void => {
            if (i >= rowsLength) {
                return cb();
            }
            const row = rows[i];
            this.rowCount += 1;
            const nextRowCount = this.rowCount;
            return this.transformRow(row, (err, transformResult): void => {
                if (err) {
                    this.rowCount -= 1;
                    return cb(err);
                }
                if (!transformResult) {
                    return cb(new Error('expected transform result'));
                }
                if (!transformResult.isValid) {
                    this.rowCount -= 1;
                    this.emit('data-invalid', transformResult.row, nextRowCount, transformResult.reason);
                } else if (!transformResult.row) {
                    this.rowCount -= 1;
                } else if (!this.parserOptions.objectMode) {
                    this.push(JSON.stringify(transformResult.row));
                } else {
                    this.push(transformResult.row);
                }
                if ((i % 100) === 0) {
                    // incase the transform are sync insert a next tick to prevent stack overflow
                    setImmediate((): void => iterate(i + 1));
                    return undefined;
                }
                return iterate(i + 1);
            });
        };
        iterate(0);
    }

    private transformRow(parsedRow: RowArray, cb: RowValidatorCallback): void {
        try {
            this.headerTransformer.transform(parsedRow, (err, withHeaders): void => {
                if (err) {
                    return cb(err);
                }
                if (!withHeaders) {
                    return cb(new Error('Expected result from header transform'));
                }
                if (!withHeaders.isValid) {
                    return cb(null, { isValid: false, row: parsedRow });
                }
                if (withHeaders.row) {
                    return this.rowTransformerValidator.transformAndValidate(withHeaders.row, cb);
                }
                return cb(null, { row: null, isValid: true });
            });
        } catch (e) {
            cb(e);
        }
    }
}
