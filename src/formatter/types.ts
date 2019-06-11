/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RowMap{
    [key: string]: any;
}

export type RowHashArray = [string, any][]
export type RowArray = string[]
export type Row = RowArray | RowMap | RowHashArray

export type RowTransformCallback = (error?: Error | null, row?: Row) => void
export interface RowTransformFunction {
    (row: Row, callback: RowTransformCallback): void;
    (row: Row): Row;
}
