/* eslint-disable @typescript-eslint/no-explicit-any */

export type RowMap<V = any> = Record<string, V>;
export type RowHashArray<V = any> = [string, V][];
export type RowArray = string[];
export type Row = RowArray | RowHashArray | RowMap;

export type RowTransformCallback<R extends Row> = (error?: Error | null, row?: R) => void;
export type SyncRowTransform<I extends Row, O extends Row> = (row: I) => O;
export type AsyncRowTransform<I extends Row, O extends Row> = (row: I, cb: RowTransformCallback<O>) => void;
export type RowTransformFunction<I extends Row, O extends Row> = SyncRowTransform<I, O> | AsyncRowTransform<I, O>;

export const isSyncTransform = <I extends Row, O extends Row>(
    transform: RowTransformFunction<I, O>,
): transform is SyncRowTransform<I, O> => transform.length === 1;
