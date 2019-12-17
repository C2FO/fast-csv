/**
 * @projectName fast-csv
 * @github https://github.com/C2FO/fast-csv
 * @includeDoc [Change Log] ../History.md
 * @header [../README.md]
 */

import { deprecate } from 'util';
import { parseStream, parseString, parseFile, RowValidateCallback } from './parser';

export {
    format,
    write,
    writeToStream,
    writeToBuffer,
    writeToString,
    writeToPath,
    FormatterOptionsArgs,
    Row as FormatterRow,
    RowMap as FormatterRowMap,
    RowArray as FormatterRowArray,
    RowHashArray as FormatterRowHashArray,
    RowTransformCallback as FormatterRowTransformCallback,
    RowTransformFunction as FormatterRowTransformFunction,
} from './formatter';
export {
    parse,
    parseString,
    parseStream,
    parseFile,
    ParserOptionsArgs,
    Row as ParserRow,
    RowMap as ParserRowMap,
    RowArray as ParserRowArray,
    RowValidateCallback as ParserRowValidateCallback,
    SyncRowValidate as ParserSyncRowValidate,
    AsyncRowValidate as ParserAsyncRowValidate,
    RowValidate as ParserRowValidate,
    RowTransformCallback as ParserRowTransformCallback,
    SyncRowTransform as ParserSyncRowTransform,
    AsyncRowTransform as ParserAsyncRowTransform,
    RowTransformFunction as ParserRowTransformFunction,
} from './parser';

export const fromString = deprecate(parseString, 'csv.fromString has been deprecated in favor of csv.parseString');
export const fromStream = deprecate(parseStream, 'csv.fromStream has been deprecated in favor of csv.parseStream');
export const fromPath = deprecate(parseFile, 'csv.fromPath has been deprecated in favor of csv.parseFile');
