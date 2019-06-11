import { isFunction } from 'lodash';
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


type RowValidator = (row: Row, cb: RowValidatorCallback) => void;

export default class RowTransformerValidator {
    private static createTransform(transformFunction: RowTransformFunction): AsyncRowTransform {
        if (isSyncTransform(transformFunction)) {
            return (row, cb): void => {
                let transformed: Row | null = null;
                try {
                    transformed = transformFunction(row);
                } catch (e) {
                    return cb(e);
                }
                return cb(null, transformed);
            };
        }
        return transformFunction as AsyncRowTransform;
    }

    private static createValidator(validateFunction: RowValidate): RowValidator {
        if (isSyncValidate(validateFunction)) {
            return (row, cb): void => {
                cb(null, { row, isValid: validateFunction(row) });
            };
        }
        return (row, cb): void => {
            (validateFunction as AsyncRowValidate)(row, (err, isValid, reason): void => {
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

    private _rowTransform: AsyncRowTransform | null = null;

    private _rowValidator: RowValidator | null = null;

    public set rowTransform(transformFunction: RowTransformFunction) {
        if (!isFunction(transformFunction)) {
            throw new TypeError('The transform should be a function');
        }
        this._rowTransform = RowTransformerValidator.createTransform(transformFunction);
    }

    public set rowValidator(validateFunction: RowValidate) {
        if (!isFunction(validateFunction)) {
            throw new TypeError('The validate should be a function');
        }
        this._rowValidator = RowTransformerValidator.createValidator(validateFunction);
    }

    public transformAndValidate(row: Row, cb: RowValidatorCallback): void {
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

    private callTransformer(row: Row, cb: RowTransformCallback): void {
        if (!this._rowTransform) {
            return cb(null, row);
        }
        return this._rowTransform(row, cb);
    }

    private callValidator(row: Row, cb: RowValidatorCallback): void {
        if (!this._rowValidator) {
            return cb(null, { row, isValid: true });
        }
        return this._rowValidator(row, cb);
    }
}
