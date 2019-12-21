import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';
import alternateEncoding from './alternateEncoding';
import noHeadersAndQuotes from './noHeadersAndQuotes';
import skipLines from './skipLines';
import withHeaders from './withHeaders';
import withHeadersAndQuotes from './withHeadersAndQuotes';
import withHeadersAndAlternateQuote from './withHeadersAndAlternateQuote';
import withHeadersAndMissingColumns from './withHeadersAndMissingColumns';
import withHeadersAlternateDelimiter from './withHeadersAlternateDelimiter';
import withHeadersSkippedLines from './withHeadersSkippedLines';
import headerColumnMismatch from './headerColumnMismatch';
import malformed from './malformed';
import trailingComma from './trailingComma';
import emptyRows from './emptyRows';
import duplicateHeaders from './duplicateHeaders';

export interface PathAndContent {
    path: string;
    content: string | Buffer;
}

const mkDirIfNotExists = (filePath: string): void => {
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir);
    }
};

const write = (opts: PathAndContent): void => {
    mkDirIfNotExists(opts.path);
    writeFileSync(opts.path, opts.content);
};

export default {
    write,
    alternateEncoding,
    duplicateHeaders,
    skipLines,
    withHeaders,
    withHeadersAndQuotes,
    withHeadersAndAlternateQuote,
    withHeadersAndMissingColumns,
    withHeadersAlternateDelimiter,
    withHeadersSkippedLines,
    noHeadersAndQuotes,
    headerColumnMismatch,
    malformed,
    trailingComma,
    emptyRows,
};
