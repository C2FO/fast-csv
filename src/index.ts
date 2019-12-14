/**
 * @projectName fast-csv
 * @github https://github.com/C2FO/fast-csv
 * @includeDoc [Change Log] ../History.md
 * @header [../README.md]
 */

import { deprecate } from 'util';
import { parseStream, parseString, parseFile } from './parser';

export { format, write, writeToStream, writeToBuffer, writeToString, writeToPath } from './formatter';
export { parse, parseString, parseStream, parseFile } from './parser';

export const fromString = deprecate(parseString, 'csv.fromString has been deprecated in favor of csv.parseString');
export const fromStream = deprecate(parseStream, 'csv.fromStream has been deprecated in favor of csv.parseStream');
export const fromPath = deprecate(parseFile, 'csv.fromPath has been deprecated in favor of csv.parseFile');
