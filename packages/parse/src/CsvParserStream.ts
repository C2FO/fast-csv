import { StringDecoder } from 'string_decoder';
import { Transform, TransformCallback } from 'stream';
import { ParserOptions } from './ParserOptions';
import { HeaderTransformer, RowTransformerValidator } from './transforms';
import { Parser } from './parser';
import { Row, RowArray, RowTransformFunction, RowValidate, RowValidatorCallback } from './types';

export class CsvParserStream<I extends Row, O extends Row> extends Transform {
    private readonly parserOptions: ParserOptions;

    private readonly decoder: StringDecoder;

    private readonly parser: Parser;

    private readonly headerTransformer: HeaderTransformer<I>;

    private readonly rowTransformerValidator: RowTransformerValidator<I, O>;

    private lines = '';

    private rowCount = 0;

    private parsedRowCount = 0;

    private parsedLineCount = 0;

    private endEmitted = false;

    private headersEmitted = false;

    public constructor(parserOptions: ParserOptions) {
        super({ objectMode: parserOptions.objectMode });
        this.parserOptions = parserOptions;
        this.parser = new Parser(parserOptions);
        this.headerTransformer = new HeaderTransformer(parserOptions);
        this.decoder = new StringDecoder(parserOptions.encoding);
        this.rowTransformerValidator = new RowTransformerValidator();
    }

    private get hasHitRowLimit(): boolean {
        return this.parserOptions.limitRows && this.rowCount >= this.parserOptions.maxRows;
    }

    private get shouldEmitRows(): boolean {
        return this.parsedRowCount > this.parserOptions.skipRows;
    }

    private get shouldSkipLine(): boolean {
        return this.parsedLineCount <= this.parserOptions.skipLines;
    }

    public transform(transformFunction: RowTransformFunction<I, O>): CsvParserStream<I, O> {
        this.rowTransformerValidator.rowTransform = transformFunction;
        return this;
    }

    public validate(validateFunction: RowValidate<O>): CsvParserStream<I, O> {
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
        // if we have hit our maxRows parsing limit then skip parsing
        if (this.hasHitRowLimit) {
            return done();
        }
        const wrappedCallback = CsvParserStream.wrapDoneCallback(done);
        try {
            const { lines } = this;
            const newLine = lines + this.decoder.write(data);
            const rows = this.parse(newLine, true);
            return this.processRows(rows, wrappedCallback);
        } catch (e) {
            return wrappedCallback(e);
        }
    }

    public _flush(done: TransformCallback): void {
        const wrappedCallback = CsvParserStream.wrapDoneCallback(done);
        // if we have hit our maxRows parsing limit then skip parsing
        if (this.hasHitRowLimit) {
            return wrappedCallback();
        }
        try {
            const newLine = this.lines + this.decoder.end();
            const rows = this.parse(newLine, false);
            return this.processRows(rows, wrappedCallback);
        } catch (e) {
            return wrappedCallback(e);
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
            const callNext = (err?: Error): void => {
                if (err) {
                    return cb(err);
                }
                if (i % 100 === 0) {
                    // incase the transform are sync insert a next tick to prevent stack overflow
                    setImmediate((): void => iterate(i + 1));
                    return undefined;
                }
                return iterate(i + 1);
            };
            this.checkAndEmitHeaders();
            // if we have emitted all rows or we have hit the maxRows limit option
            // then end
            if (i >= rowsLength || this.hasHitRowLimit) {
                return cb();
            }
            this.parsedLineCount += 1;
            if (this.shouldSkipLine) {
                return callNext();
            }
            const row = rows[i];
            this.rowCount += 1;
            this.parsedRowCount += 1;
            const nextRowCount = this.rowCount;
            return this.transformRow(row, (err, transformResult): void => {
                if (err) {
                    this.rowCount -= 1;
                    return callNext(err);
                }
                if (!transformResult) {
                    return callNext(new Error('expected transform result'));
                }
                if (!transformResult.isValid) {
                    this.emit('data-invalid', transformResult.row, nextRowCount, transformResult.reason);
                } else if (transformResult.row) {
                    return this.pushRow(transformResult.row, callNext);
                }
                return callNext();
            });
        };
        iterate(0);
    }

    private transformRow(parsedRow: RowArray, cb: RowValidatorCallback<O>): void {
        try {
            this.headerTransformer.transform(parsedRow, (err, withHeaders): void => {
                if (err) {
                    return cb(err);
                }
                if (!withHeaders) {
                    return cb(new Error('Expected result from header transform'));
                }
                if (!withHeaders.isValid) {
                    if (this.shouldEmitRows) {
                        return cb(null, { isValid: false, row: parsedRow as never as O });
                    }
                    // skipped because of skipRows option remove from total row count
                    return this.skipRow(cb);
                }
                if (withHeaders.row) {
                    if (this.shouldEmitRows) {
                        return this.rowTransformerValidator.transformAndValidate(withHeaders.row, cb);
                    }
                    // skipped because of skipRows option remove from total row count
                    return this.skipRow(cb);
                }
                // this is a header row dont include in the rowCount or parsedRowCount
                this.rowCount -= 1;
                this.parsedRowCount -= 1;
                return cb(null, { row: null, isValid: true });
            });
        } catch (e) {
            cb(e);
        }
    }

    private checkAndEmitHeaders(): void {
        if (!this.headersEmitted && this.headerTransformer.headers) {
            this.headersEmitted = true;
            this.emit('headers', this.headerTransformer.headers);
        }
    }

    private skipRow(cb: RowValidatorCallback<O>): void {
        // skipped because of skipRows option remove from total row count
        this.rowCount -= 1;
        return cb(null, { row: null, isValid: true });
    }

    private pushRow(row: Row, cb: (err?: Error) => void): void {
        try {
            if (!this.parserOptions.objectMode) {
                this.push(JSON.stringify(row));
            } else {
                this.push(row);
            }
            cb();
        } catch (e) {
            cb(e);
        }
    }

    private static wrapDoneCallback(done: TransformCallback): TransformCallback {
        let errorCalled = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (err: Error | null | undefined, ...args: any[]): void => {
            if (err) {
                if (errorCalled) {
                    throw err;
                }
                errorCalled = true;
                done(err);
                return;
            }
            done(...args);
        };
    }
}
