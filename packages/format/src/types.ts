/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RowMap {
    [key: string]: any;
}

export type RowHashArray = [string, any][];
export type RowArray = string[];
export type Row = RowArray | RowHashArray | RowMap;

export type RowTransformCallback<R extends Row> = (error?: Error | null, row?: R) => void;
export type SyncRowTransform<I extends Row, O extends Row> = (row: I) => O;
export type AsyncRowTransform<I extends Row, O extends Row> = (row: I, cb: RowTransformCallback<O>) => void;
export type RowTransformFunction<I extends Row, O extends Row> = SyncRowTransform<I, O> | AsyncRowTransform<I, O>;

export const isSyncTransform = <I extends Row, O extends Row>(
    transform: RowTransformFunction<I, O>,
): transform is SyncRowTransform<I, O> => transform.length === 1;
