import { Transform, TransformCallback } from 'stream';
import { FormatterOptions } from './FormatterOptions';
import { Row, RowTransformFunction } from './types';
import { RowFormatter } from './formatter';

export class CsvFormatterStream<I extends Row, O extends Row> extends Transform {
    private formatterOptions: FormatterOptions<I, O>;

    private rowFormatter: RowFormatter<I, O>;

    private hasWrittenBOM = false;

    public constructor(formatterOptions: FormatterOptions<I, O>) {
        super({ writableObjectMode: formatterOptions.objectMode });
        this.formatterOptions = formatterOptions;
        this.rowFormatter = new RowFormatter(formatterOptions);
        // if writeBOM is false then set to true
        // if writeBOM is true then set to false by default so it is written out
        this.hasWrittenBOM = !formatterOptions.writeBOM;
    }

    public transform(transformFunction: RowTransformFunction<I, O>): CsvFormatterStream<I, O> {
        this.rowFormatter.rowTransform = transformFunction;
        return this;
    }

    public _transform(row: I, encoding: string, cb: TransformCallback): void {
        let cbCalled = false;
        try {
            if (!this.hasWrittenBOM) {
                this.push(this.formatterOptions.BOM);
                this.hasWrittenBOM = true;
            }
            this.rowFormatter.format(row, (err, rows): void => {
                if (err) {
                    cbCalled = true;
                    return cb(err);
                }
                if (rows) {
                    rows.forEach((r): void => {
                        this.push(Buffer.from(r, 'utf8'));
                    });
                }
                cbCalled = true;
                return cb();
            });
        } catch (e) {
            if (cbCalled) {
                throw e;
            }
            cb(e);
        }
    }

    public _flush(cb: TransformCallback): void {
        this.rowFormatter.finish((err, rows): void => {
            if (err) {
                return cb(err);
            }
            if (rows && rows.length > 0) {
                // Headers may be flushed here with no preceding rows (e.g.
                // `alwaysWriteHeaders` with an empty input), so _transform never
                // ran and the BOM hasn't been written yet.
                if (!this.hasWrittenBOM) {
                    this.push(this.formatterOptions.BOM);
                    this.hasWrittenBOM = true;
                }
                rows.forEach((r): void => {
                    this.push(Buffer.from(r, 'utf8'));
                });
            }
            return cb();
        });
    }
}
