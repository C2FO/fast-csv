// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RowMap = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RowArray = any[];
export type Row = RowMap | RowArray;

export interface RowValidationResult<R extends Row> {
    row: R | null;
    isValid: boolean;
    reason?: string;
}

export type RowValidatorCallback<R extends Row> = (error: Error | null, result?: RowValidationResult<R>) => void;

export type RowTransformCallback<R extends Row> = (error?: Error | null, row?: R) => void;
export type SyncRowTransform<I extends Row, O extends Row> = (row: I) => O;
export type AsyncRowTransform<I extends Row, O extends Row> = (row: I, cb: RowTransformCallback<O>) => void;
export type RowTransformFunction<I extends Row, O extends Row> = SyncRowTransform<I, O> | AsyncRowTransform<I, O>;

export const isSyncTransform = <I extends Row, O extends Row>(
    transform: RowTransformFunction<I, O>,
): transform is SyncRowTransform<I, O> => transform.length === 1;

export type RowValidateCallback = (error?: Error | null, isValid?: boolean, reason?: string) => void;

export type SyncRowValidate<R extends Row> = (row: R) => boolean;
export type AsyncRowValidate<R extends Row> = (row: R, cb: RowValidateCallback) => void;
export type RowValidate<R extends Row> = AsyncRowValidate<R> | SyncRowValidate<R>;

export const isSyncValidate = <R extends Row>(validate: RowValidate<R>): validate is SyncRowValidate<R> =>
    validate.length === 1;

export type HeaderArray = (string | undefined | null)[];
export type HeaderTransformFunction = (headers: HeaderArray) => HeaderArray;
