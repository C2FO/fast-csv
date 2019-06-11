export interface RowMap {
    [s: string]: string;
}
export type RowArray = string[];
export type Row = string[] | object

export interface RowValidationResult {
    row: Row | null;
    isValid: boolean;
    reason?: string;
}

export type RowValidatorCallback = (error: Error | null, result?: RowValidationResult) => void;

export type RowTransformCallback = (error?: Error | null, row?: Row) => void
export type SyncRowTransform = (row: Row) => Row
export type AsyncRowTransform = (row: Row, cb: RowTransformCallback) => void
export type RowTransformFunction = SyncRowTransform | AsyncRowTransform

export const isSyncTransform = (transform: RowTransformFunction): transform is SyncRowTransform => transform.length === 1;

export type RowValidateCallback = (error?: Error | null, isValid?: boolean, reason?: string) => void

export type SyncRowValidate = (row: Row) => boolean
export type AsyncRowValidate = (row: Row, cb: RowValidateCallback) => void
export type RowValidate = AsyncRowValidate | SyncRowValidate

export const isSyncValidate = (validate: RowValidate): validate is SyncRowValidate => validate.length === 1;
