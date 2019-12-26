import isFunction from 'lodash.isfunction';
import {
    Row,
    RowTransformFunction,
    RowValidatorCallback,
    AsyncRowValidate,
    isSyncValidate,
    RowValidate,
    isSyncTransform,
    AsyncRowTransform,
    RowTransformCallback,
} from '../types';

type RowValidator<R extends Row> = (row: R, cb: RowValidatorCallback<R>) => void;

export class RowTransformerValidator<I extends Row, O extends Row> {
    private static createTransform<I extends Row, O extends Row>(
        transformFunction: RowTransformFunction<I, O>,
    ): AsyncRowTransform<I, O> {
        if (isSyncTransform(transformFunction)) {
            return (row, cb): void => {
                let transformed: O | null = null;
                try {
                    transformed = transformFunction(row);
                } catch (e) {
                    return cb(e);
                }
                return cb(null, transformed);
            };
        }
        return transformFunction as AsyncRowTransform<I, O>;
    }

    private static createValidator<R extends Row>(validateFunction: RowValidate<R>): RowValidator<R> {
        if (isSyncValidate(validateFunction)) {
            return (row: R, cb: RowValidatorCallback<R>): void => {
                cb(null, { row, isValid: validateFunction(row) });
            };
        }
        return (row, cb): void => {
            (validateFunction as AsyncRowValidate<R>)(row, (err, isValid, reason): void => {
                if (err) {
                    return cb(err);
                }
                if (isValid) {
                    return cb(null, { row, isValid, reason });
                }
                return cb(null, { row, isValid: false, reason });
            });
        };
    }

    private _rowTransform: AsyncRowTransform<I, O> | null = null;

    private _rowValidator: RowValidator<O> | null = null;

    public set rowTransform(transformFunction: RowTransformFunction<I, O>) {
        if (!isFunction(transformFunction)) {
            throw new TypeError('The transform should be a function');
        }
        this._rowTransform = RowTransformerValidator.createTransform(transformFunction);
    }

    public set rowValidator(validateFunction: RowValidate<O>) {
        if (!isFunction(validateFunction)) {
            throw new TypeError('The validate should be a function');
        }
        this._rowValidator = RowTransformerValidator.createValidator(validateFunction);
    }

    public transformAndValidate(row: I, cb: RowValidatorCallback<O>): void {
        return this.callTransformer(row, (transformErr, transformedRow): void => {
            if (transformErr) {
                return cb(transformErr);
            }
            if (!transformedRow) {
                return cb(null, { row: null, isValid: true });
            }
            return this.callValidator(transformedRow, (validateErr, validationResult): void => {
                if (validateErr) {
                    return cb(validateErr);
                }
                if (validationResult && !validationResult.isValid) {
                    return cb(null, { row: transformedRow, isValid: false, reason: validationResult.reason });
                }
                return cb(null, { row: transformedRow, isValid: true });
            });
        });
    }

    private callTransformer(row: I, cb: RowTransformCallback<O>): void {
        if (!this._rowTransform) {
            return cb(null, (row as never) as O);
        }
        return this._rowTransform(row, cb);
    }

    private callValidator(row: O, cb: RowValidatorCallback<O>): void {
        if (!this._rowValidator) {
            return cb(null, { row, isValid: true });
        }
        return this._rowValidator(row, cb);
    }
}
