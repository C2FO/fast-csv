import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';
import noHeadersAndQuotes from './noHeadersAndQuotes';
import withHeaders from './withHeaders';
import withHeadersAndQuotes from './withHeadersAndQuotes';
import withHeadersAndAlternateQuote from './withHeadersAndAlternateQuote';
import withHeadersAndMissingColumns from './withHeadersAndMissingColumns';
import withHeadersAlternateDelimiter from './withHeadersAlternateDelimiter';
import headerColumnMismatch from './headerColumnMismatch';
import malformed from './malformed';
import trailingComma from './trailingComma';
import emptyRows from './emptyRows';

export interface PathAndContent {
    path: string;
    content: string;
}

const mkDirIfNotExists = (filePath: string) => {
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir);
    }
};

const write = (opts: PathAndContent) => {
    mkDirIfNotExists(opts.path);
    writeFileSync(opts.path, opts.content);
};

export default {
    write,
    withHeaders,
    withHeadersAndQuotes,
    withHeadersAndAlternateQuote,
    withHeadersAndMissingColumns,
    withHeadersAlternateDelimiter,
    noHeadersAndQuotes,
    headerColumnMismatch,
    malformed,
    trailingComma,
    emptyRows,
};
