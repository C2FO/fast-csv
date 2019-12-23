import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';
import { PathAndContent } from './helpers';

export * from './alternateEncoding';
export * from './noHeadersAndQuotes';
export * from './skipLines';
export * from './withHeaders';
export * from './withHeadersAndQuotes';
export * from './withHeadersAndAlternateQuote';
export * from './withHeadersAndMissingColumns';
export * from './withHeadersAlternateDelimiter';
export * from './withHeadersAndSkippedLines';
export * from './headerColumnMismatch';
export * from './malformed';
export * from './trailingComma';
export * from './emptyRows';
export * from './duplicateHeaders';
export * from './RecordingStream';
export * from './helpers';

const mkDirIfNotExists = (filePath: string): void => {
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir);
    }
};

export const write = (opts: PathAndContent): void => {
    mkDirIfNotExists(opts.path);
    writeFileSync(opts.path, opts.content);
};
