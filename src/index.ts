/**
 * @projectName fast-csv
 * @github https://github.com/C2FO/fast-csv
 * @includeDoc [Change Log] ../History.md
 * @header [../README.md]
 */

import { deprecate } from 'util';
import {
    format, write, writeToStream, writeToBuffer, writeToString, writeToPath,
} from './formatter';
import {
    parse, parseString, parseStream, parseFile,
} from './parser';


const csv = {
    parse,
    parseString,
    fromString: deprecate(parseString, 'csv.fromString has been deprecated in favor of csv.parseString'),
    parseStream,
    fromStream: deprecate(parseStream, 'csv.fromStream has been deprecated in favor of csv.parseStream'),
    parseFile,
    fromPath: deprecate(parseFile, 'csv.fromPath has been deprecated in favor of csv.parseFile'),
    format,
    write,
    writeToStream,
    writeToBuffer,
    writeToString,
    writeToPath,
};

export = csv;
