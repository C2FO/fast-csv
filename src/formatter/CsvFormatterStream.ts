import { Transform, TransformCallback } from 'stream';
import { FormatterOptions } from './FormatterOptions';
import { Row, RowTransformFunction } from './types';
import RowFormatter from './formatter/RowFormatter';

export default class CsvFormatterStream extends Transform {
    private formatterOptions: FormatterOptions;

    private rowFormatter: RowFormatter;

    public constructor(formatterOptions: FormatterOptions) {
        super({ objectMode: formatterOptions.objectMode });
        this.formatterOptions = formatterOptions;
        this.rowFormatter = new RowFormatter(formatterOptions);
    }

    public transform(transformFunction: RowTransformFunction): CsvFormatterStream {
        this.rowFormatter.rowTransform = transformFunction;
        return this;
    }

    public _transform(row: Row, encoding: string, cb: TransformCallback): void {
        let cbCalled = false;
        try {
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
        if (this.formatterOptions.includeEndRowDelimiter) {
            this.push(this.formatterOptions.rowDelimiter);
        }
        cb();
    }
}
