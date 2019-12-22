/* eslint-disable no-cond-assign,@typescript-eslint/camelcase,@typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as domain from 'domain';
import partition from 'lodash.partition';
import * as csv from '../../src';
import assets, { PathAndContent } from './__fixtures__';
import { CsvParserStream } from '../../src/parser';

import DoneCallback = jest.DoneCallback;

describe('CsvParserStream', () => {
    const listenForError = (stream: CsvParserStream, message: string, next: DoneCallback) => {
        let called = false;
        stream
            .on('error', (err: Error) => {
                expect(err.message).toBe(message);
                if (!called) {
                    called = true;
                    next();
                }
            })
            .on('end', () => next(new Error(`Expected and error to occur [expectedMessage=${message}]`)));
    };

    interface ParseResults {
        count: number;
        rows: csv.ParserRow[];
        invalidRows: csv.ParserRow[];
    }

    const collectData = (stream: CsvParserStream): Promise<ParseResults> =>
        new Promise((res, rej) => {
            const rows: csv.ParserRow[] = [];
            const invalidRows: csv.ParserRow[] = [];
            stream
                .on('data', (row: csv.ParserRow) => rows.push(row))
                .on('data-invalid', (row: csv.ParserRow) => invalidRows.push(row))
                .on('error', rej)
                .on('end', (count: number) => {
                    res({ count, rows, invalidRows });
                });
        });

    const parseContentAndCollectFromStream = (data: PathAndContent, parser: CsvParserStream): Promise<ParseResults> =>
        new Promise((res, rej) => {
            const rows: csv.ParserRow[] = [];
            const invalidRows: csv.ParserRow[] = [];
            parser
                .on('data', row => rows.push(row))
                .on('data-invalid', row => invalidRows.push(row))
                .on('error', rej)
                .on('end', (count: number) => {
                    res({ count, rows, invalidRows });
                });
            parser.write(data.content);
            parser.end();
        });

    const parseContentAndCollect = (data: PathAndContent, options: csv.ParserOptionsArgs = {}): Promise<ParseResults> =>
        new Promise((res, rej) => {
            const rows: csv.ParserRow[] = [];
            const invalidRows: csv.ParserRow[] = [];
            const parser = csv
                .parse(options)
                .on('data', row => rows.push(row))
                .on('data-invalid', row => invalidRows.push(row))
                .on('error', rej)
                .on('end', (count: number) => {
                    res({ count, rows, invalidRows });
                });
            parser.write(data.content);
            parser.end();
        });

    const expectParsed = (
        resultsPromise: Promise<ParseResults>,
        expectedRows: any[],
        expectedInvalidRows: any[] = [],
    ): Promise<void> => {
        return expect(resultsPromise).resolves.toEqual({
            count: expectedRows.length + expectedInvalidRows.length,
            rows: expectedRows,
            invalidRows: expectedInvalidRows,
        });
    };

    it('should parse a csv without quotes or escapes', () =>
        expectParsed(parseContentAndCollect(assets.withHeaders, { headers: true }), assets.withHeaders.parsed));

    it('should emit a readable event ', next => {
        const actual: csv.ParserRow[] = [];
        const parser = csv.parse({ headers: true });
        const stream = parser.on('error', next).on('end', (count: number) => {
            expect(actual).toEqual(assets.withHeaders.parsed);
            expect(count).toBe(actual.length);
            next();
        });
        let index = 0;
        stream.on('readable', () => {
            for (let data = stream.read(); data !== null; data = stream.read()) {
                actual[index] = data;
                index += 1;
            }
        });
        stream.write(assets.withHeaders.content);
        stream.end();
    });

    it('should emit data as a buffer if objectMode is false', async () => {
        const expected = assets.withHeaders.parsed.map(r => Buffer.from(JSON.stringify(r)));
        await expectParsed(parseContentAndCollect(assets.withHeaders, { headers: true, objectMode: false }), expected);
    });

    it('should emit data as an object if objectMode is true', () =>
        expectParsed(
            parseContentAndCollect(assets.withHeaders, { headers: true, objectMode: true }),
            assets.withHeaders.parsed,
        ));

    it('should emit data as an object if objectMode is not specified', () =>
        expectParsed(parseContentAndCollect(assets.withHeaders, { headers: true }), assets.withHeaders.parsed));

    it('should parse a csv with quotes', () =>
        expectParsed(
            parseContentAndCollect(assets.withHeadersAndQuotes, { headers: true }),
            assets.withHeadersAndQuotes.parsed,
        ));

    it('should parse a csv with without headers', () =>
        expectParsed(parseContentAndCollect(assets.noHeadersAndQuotes), assets.noHeadersAndQuotes.parsed));

    it("should parse a csv with ' escapes", () =>
        expectParsed(
            parseContentAndCollect(assets.withHeadersAndAlternateQuote, { headers: true, quote: "'" }),
            assets.withHeadersAndAlternateQuote.parsed,
        ));

    describe('headers option', () => {
        it('should allow specifying of headers', async () => {
            const expected = assets.noHeadersAndQuotes.parsed.map(r => ({
                first_name: r[0],
                last_name: r[1],
                email_address: r[2],
                address: r[3],
            }));
            await expectParsed(
                parseContentAndCollect(assets.noHeadersAndQuotes, {
                    headers: ['first_name', 'last_name', 'email_address', 'address'],
                }),
                expected,
            );
        });

        it('should allow transforming headers with a function', async () => {
            const expected = assets.withHeadersAndQuotes.parsed.map(r => ({
                firstName: r.first_name,
                lastName: r.last_name,
                emailAddress: r.email_address,
                address: r.address,
            }));
            const transform = jest.fn().mockReturnValue(['firstName', 'lastName', 'emailAddress', 'address']);
            await expectParsed(parseContentAndCollect(assets.withHeadersAndQuotes, { headers: transform }), expected);
            expect(transform).toBeCalledTimes(1);
            expect(transform).toBeCalledWith(['first_name', 'last_name', 'email_address', 'address']);
        });

        describe('renameHeaders option', () => {
            it('should allow renaming headers', async () => {
                const expected = assets.withHeadersAndQuotes.parsed.map(r => ({
                    firstName: r.first_name,
                    lastName: r.last_name,
                    emailAddress: r.email_address,
                    address: r.address,
                }));
                await expectParsed(
                    parseContentAndCollect(assets.withHeadersAndQuotes, {
                        headers: ['firstName', 'lastName', 'emailAddress', 'address'],
                        renameHeaders: true,
                    }),
                    expected,
                );
            });

            it('should ignore the renameHeaders option if transforming headers with a function', async () => {
                const expected = assets.withHeadersAndQuotes.parsed.map(r => ({
                    firstName: r.first_name,
                    lastName: r.last_name,
                    emailAddress: r.email_address,
                    address: r.address,
                }));
                const transform = jest.fn().mockReturnValue(['firstName', 'lastName', 'emailAddress', 'address']);
                await expectParsed(
                    parseContentAndCollect(assets.withHeadersAndQuotes, { headers: transform, renameHeaders: true }),
                    expected,
                );
                expect(transform).toBeCalledTimes(1);
                expect(transform).toBeCalledWith(['first_name', 'last_name', 'email_address', 'address']);
            });

            it('should propagate an error when trying to rename headers without providing new ones', next => {
                const stream = csv.parse({ renameHeaders: true });
                listenForError(stream, 'Error renaming headers: new headers must be provided in an array', next);
                stream.write(assets.withHeadersAndQuotes.content);
                stream.end();
            });

            it('should propagate an error when trying to rename headers without providing proper ones', next => {
                const stream = csv.parse({ renameHeaders: true, headers: true });
                listenForError(stream, 'Error renaming headers: new headers must be provided in an array', next);
                stream.write(assets.withHeadersAndQuotes.content);
                stream.end();
            });
        });

        it('should propagate an error header length does not match column length', next => {
            const stream = csv.parse({ headers: true });
            listenForError(stream, 'Unexpected Error: column header mismatch expected: 4 columns got: 5', next);
            stream.write(assets.headerColumnMismatch.content);
            stream.end();
        });

        it('should propagate an error if headers are not unique', next => {
            const stream = csv.parse({ headers: true });
            listenForError(stream, 'Duplicate headers found ["first_name"]', next);
            stream.write(assets.duplicateHeaders.content);
            stream.end();
        });

        it('should discard extra columns that do not map to a header when discardUnmappedColumns is true', () =>
            expectParsed(
                parseContentAndCollect(assets.headerColumnMismatch, { headers: true, discardUnmappedColumns: true }),
                assets.headerColumnMismatch.parsed,
            ));

        it('should report missing columns that do not exist but have a header with strictColumnHandling option', async () => {
            const expectedRows = assets.withHeadersAndMissingColumns.parsed.filter(r => r.address !== null);
            const expectedInvalidRows = assets.withHeadersAndMissingColumns.parsed
                .filter(r => r.address === null)
                .map(r => Object.values(r).filter(v => !!v));
            await expectParsed(
                parseContentAndCollect(assets.withHeadersAndMissingColumns, {
                    headers: true,
                    strictColumnHandling: true,
                }),
                expectedRows,
                expectedInvalidRows,
            );
        });

        it('should allow specifying of columns as a sparse array', async () => {
            const expected = assets.noHeadersAndQuotes.parsed.map(r => ({
                first_name: r[0],
                email_address: r[2],
            }));
            await expectParsed(
                parseContentAndCollect(assets.noHeadersAndQuotes, {
                    headers: ['first_name', undefined, 'email_address', undefined],
                }),
                expected,
            );
        });
    });

    it('should parse data with an alternate encoding', () =>
        expectParsed(
            parseContentAndCollect(assets.alternateEncoding, { headers: true, encoding: 'utf16le' }),
            assets.alternateEncoding.parsed,
        ));

    it('should handle a trailing comma', () =>
        expectParsed(parseContentAndCollect(assets.trailingComma, { headers: true }), assets.trailingComma.parsed));

    it('should skip valid, but empty rows when ignoreEmpty is true', () =>
        expectParsed(parseContentAndCollect(assets.emptyRows, { headers: true, ignoreEmpty: true }), []));

    describe('alternate delimiters', () => {
        ['\t', '|', ';'].forEach(delimiter => {
            it(`should support '${delimiter.replace(/\t/, '\\t')}' delimiters`, async () => {
                const { path: assetPath, content } = assets.withHeadersAlternateDelimiter;
                const data = { path: assetPath, content: content(delimiter) };
                await expectParsed(
                    parseContentAndCollect(data, { headers: true, delimiter }),
                    assets.withHeadersAlternateDelimiter.parsed,
                );
            });
        });
    });

    describe('maxRows option', () => {
        it('should parse up to the specified number of maxRows', async () => {
            const maxRows = 3;
            await expectParsed(
                parseContentAndCollect(assets.withHeaders, { headers: true, maxRows }),
                assets.withHeaders.parsed.slice(0, maxRows),
            );
        });

        it('should parse all rows if maxRows === 0', async () => {
            const maxRows = 0;
            await expectParsed(
                parseContentAndCollect(assets.withHeaders, { headers: true, maxRows }),
                assets.withHeaders.parsed,
            );
        });
    });

    describe('skipLines option', () => {
        it('should skip up to the specified number of rows using the first non-skipped line as headers', async () => {
            const skipLines = 2;
            await expectParsed(
                parseContentAndCollect(assets.withHeadersSkippedLines, { headers: true, skipLines }),
                assets.withHeadersSkippedLines.parsed,
            );
        });

        it('should skip up to the specified number of rows not withoutHeaders', async () => {
            const skipLines = 2;
            await expectParsed(parseContentAndCollect(assets.skipLines, { skipLines }), assets.skipLines.parsed);
        });

        describe('with transform', () => {
            it('should not transform skipped rows', async () => {
                let transformedRows: csv.ParserRow[] = [];
                const transformer = (row: csv.ParserRow): csv.ParserRow => {
                    const transformed = {
                        firstName: (row as csv.ParserRowMap).first_name,
                        lastName: (row as csv.ParserRowMap).last_name,
                        emailAddress: (row as csv.ParserRowMap).email_address,
                    };
                    transformedRows.push(transformed);
                    return transformed;
                };
                const skipLines = 2;
                const expected = assets.withHeadersSkippedLines.parsed.map(transformer);
                transformedRows = [];
                const parser = csv.parse({ headers: true, skipLines }).transform(transformer);
                await expectParsed(parseContentAndCollectFromStream(assets.withHeadersSkippedLines, parser), expected);
                expect(transformedRows).toEqual(expected);
            });
        });

        describe('with validate', () => {
            it('should not validate skipped rows', async () => {
                let validatedRows: csv.ParserRow[] = [];
                const validator = (row: csv.ParserRow): boolean => {
                    validatedRows.push(row);
                    return (validatedRows.length - 1) % 2 === 0;
                };
                const skipLines = 2;
                const nonSkippedRows = assets.withHeadersSkippedLines.parsed;
                const [expected, invalid] = partition(nonSkippedRows, validator);
                validatedRows = [];
                const parser = csv.parse({ headers: true, skipLines }).validate(validator);
                await expectParsed(
                    parseContentAndCollectFromStream(assets.withHeadersSkippedLines, parser),
                    expected,
                    invalid,
                );
                expect(validatedRows).toEqual(nonSkippedRows);
            });
        });

        it('should parse all rows if maxRows === 0', async () => {
            const skipLines = 0;
            await expectParsed(
                parseContentAndCollect(assets.withHeaders, { headers: true, skipLines }),
                assets.withHeaders.parsed,
            );
        });
    });

    describe('skipRows option', () => {
        describe('with headers', () => {
            it('should skip up to the specified number of rows not including the header row in the count', async () => {
                const skipRows = 3;
                await expectParsed(
                    parseContentAndCollect(assets.withHeaders, { headers: true, skipRows }),
                    assets.withHeaders.parsed.slice(skipRows),
                );
            });

            it('should skip up to the specified number of rows and allow renaming the headers', async () => {
                const skipRows = 3;
                const expected = assets.withHeaders.parsed.slice(skipRows).map(r => {
                    return {
                        h1: r.first_name,
                        h2: r.last_name,
                        h3: r.email_address,
                    };
                });
                await expectParsed(
                    parseContentAndCollect(assets.withHeaders, {
                        headers: ['h1', 'h2', 'h3'],
                        renameHeaders: true,
                        skipRows,
                    }),
                    expected,
                );
            });
        });

        describe('without headers', () => {
            it('should skip up to the specified number of rows without headers', async () => {
                const skipRows = 3;
                const expected = assets.noHeadersAndQuotes.parsed.slice(skipRows);
                await expectParsed(parseContentAndCollect(assets.noHeadersAndQuotes, { skipRows }), expected);
            });

            it('should skip up to the specified number of rows without headers and allow specifying headers', async () => {
                const skipRows = 3;
                const expected = assets.noHeadersAndQuotes.parsed.slice(skipRows).map(r => {
                    return {
                        h1: r[0],
                        h2: r[1],
                        h3: r[2],
                        h4: r[3],
                    };
                });
                await expectParsed(
                    parseContentAndCollect(assets.noHeadersAndQuotes, { headers: ['h1', 'h2', 'h3', 'h4'], skipRows }),
                    expected,
                );
            });
        });

        describe('with transform', () => {
            it('should not transform skipped rows', async () => {
                let transformedRows: csv.ParserRow[] = [];
                const transformer = (row: csv.ParserRow): csv.ParserRow => {
                    const transformed = {
                        firstName: (row as csv.ParserRowMap).first_name,
                        lastName: (row as csv.ParserRowMap).last_name,
                        emailAddress: (row as csv.ParserRowMap).email_address,
                        address: (row as csv.ParserRowMap).address,
                    };
                    transformedRows.push(transformed);
                    return transformed;
                };
                const skipRows = 3;
                const expected = assets.withHeaders.parsed.slice(skipRows).map(transformer);
                transformedRows = [];
                const parser = csv.parse({ headers: true, skipRows }).transform(transformer);
                await expectParsed(parseContentAndCollectFromStream(assets.withHeaders, parser), expected);
                expect(transformedRows).toEqual(expected);
            });
        });

        describe('with validate', () => {
            it('should not validate skipped rows', async () => {
                let validatedRows: csv.ParserRow[] = [];
                const validator = (row: csv.ParserRow): boolean => {
                    validatedRows.push(row);
                    return (validatedRows.length - 1) % 2 === 0;
                };
                const skipRows = 3;
                const nonSkippedRows = assets.withHeaders.parsed.slice(skipRows);
                const [expected, invalid] = partition(nonSkippedRows, validator);
                validatedRows = [];
                const parser = csv.parse({ headers: true, skipRows }).validate(validator);
                await expectParsed(parseContentAndCollectFromStream(assets.withHeaders, parser), expected, invalid);
                expect(validatedRows).toEqual(nonSkippedRows);
            });
        });

        it('should parse all rows if maxRows === 0', async () => {
            const skipRows = 0;
            await expectParsed(
                parseContentAndCollect(assets.withHeaders, { headers: true, skipRows }),
                assets.withHeaders.parsed,
            );
        });
    });

    it('should emit an error for malformed rows', next => {
        assets.write(assets.malformed);
        const stream = csv.parseFile(assets.malformed.path, { headers: true });
        listenForError(stream, "Parse Error: expected: ',' OR new line got: 'a'. at 'a   \", Las", next);
    });

    describe('#validate', () => {
        const syncValidator = (row: csv.ParserRow): boolean =>
            parseInt((row as csv.ParserRowMap).first_name.replace(/^First/, ''), 10) % 2 === 1;
        const asyncValidator = (row: csv.ParserRow, cb: csv.ParserRowValidateCallback) => {
            cb(null, syncValidator(row));
        };

        it('should allow validation of rows', async () => {
            const [valid, invalid] = partition(assets.withHeaders.parsed, syncValidator);
            const parser = csv.parse({ headers: true }).validate(syncValidator);
            await expectParsed(parseContentAndCollectFromStream(assets.withHeaders, parser), valid, invalid);
        });

        it('should allow async validation of rows', async () => {
            const validator = (row: csv.ParserRow): boolean =>
                parseInt((row as csv.ParserRowMap).first_name.replace(/^First/, ''), 10) % 2 !== 0;
            const [valid, invalid] = partition(assets.withHeaders.parsed, validator);
            const parser = csv.parse({ headers: true }).validate(asyncValidator);
            await expectParsed(parseContentAndCollectFromStream(assets.withHeaders, parser), valid, invalid);
        });

        it('should propagate errors from async validation', next => {
            assets.write(assets.withHeaders);
            let index = -1;
            const stream = csv
                .parseFile(assets.withHeaders.path, { headers: true })
                .validate((data: csv.ParserRow, validateNext): void => {
                    setImmediate(() => {
                        index += 1;
                        if (index === 8) {
                            validateNext(new Error('Validation ERROR!!!!'));
                        } else {
                            validateNext(null, true);
                        }
                    });
                });
            listenForError(stream, 'Validation ERROR!!!!', next);
        });

        it('should propagate async errors at the beginning', next => {
            assets.write(assets.withHeaders);
            const stream = csv
                .parseFile(assets.withHeaders.path, { headers: true })
                .validate((data, validateNext) => validateNext(new Error('Validation ERROR!!!!')));
            listenForError(stream, 'Validation ERROR!!!!', next);
        });

        it('should propagate thrown errors', next => {
            assets.write(assets.withHeaders);
            let index = -1;
            const stream = csv.parseFile(assets.withHeaders.path, { headers: true }).validate((data, validateNext) => {
                index += 1;
                if (index === 8) {
                    throw new Error('Validation ERROR!!!!');
                } else {
                    setImmediate(() => validateNext(null, true));
                }
            });
            listenForError(stream, 'Validation ERROR!!!!', next);
        });

        it('should propagate thrown errors at the beginning', next => {
            assets.write(assets.withHeaders);
            const stream = csv.parseFile(assets.withHeaders.path, { headers: true }).validate(() => {
                throw new Error('Validation ERROR!!!!');
            });
            listenForError(stream, 'Validation ERROR!!!!', next);
        });

        it('should throw an error if validate is not called with a function', () => {
            // @ts-ignore
            expect(() => csv.parse({ headers: true }).validate('hello')).toThrowError(
                'The validate should be a function',
            );
        });
    });

    describe('#transform', () => {
        const transformer = (row: csv.ParserRow): csv.ParserRow => ({
            firstName: (row as csv.ParserRowMap).first_name,
            lastName: (row as csv.ParserRowMap).last_name,
            emailAddress: (row as csv.ParserRowMap).email_address,
            address: (row as csv.ParserRowMap).address,
        });

        it('should allow transforming of data', async () => {
            const expected = assets.withHeaders.parsed.map(transformer);
            const parser = csv.parse({ headers: true }).transform(transformer);
            await expectParsed(parseContentAndCollectFromStream(assets.withHeaders, parser), expected);
        });

        it('should async transformation of data', async () => {
            const expected = assets.withHeaders.parsed.map(transformer);
            const parser = csv
                .parse({ headers: true })
                .transform((row, next) => setImmediate(() => next(null, transformer(row))));
            await expectParsed(parseContentAndCollectFromStream(assets.withHeaders, parser), expected);
        });

        it('should propogate errors when transformation of data', next => {
            assets.write(assets.withHeaders);
            let index = -1;
            const stream = csv.parseFile(assets.withHeaders.path, { headers: true }).transform((data, cb) =>
                setImmediate(() => {
                    index += 1;
                    if (index === 8) {
                        cb(new Error('transformation ERROR!!!!'));
                    } else {
                        cb(null, transformer(data));
                    }
                }),
            );
            listenForError(stream, 'transformation ERROR!!!!', next);
        });

        it('should propogate errors when transformation of data at the beginning', next => {
            assets.write(assets.withHeaders);
            const stream = csv
                .parseFile(assets.withHeaders.path, { headers: true })
                .transform((data, cb) => setImmediate(() => cb(new Error('transformation ERROR!!!!'))));
            listenForError(stream, 'transformation ERROR!!!!', next);
        });

        it('should propagate thrown errors at the end', next => {
            assets.write(assets.withHeaders);
            let index = -1;
            const stream = csv.parseFile(assets.withHeaders.path, { headers: true }).transform((data, cb) => {
                index += 1;
                if (index === 8) {
                    throw new Error('transformation ERROR!!!!');
                } else {
                    setImmediate(() => cb(null, data));
                }
            });
            listenForError(stream, 'transformation ERROR!!!!', next);
        });

        it('should propagate thrown errors at the beginning', next => {
            assets.write(assets.withHeaders);
            const stream = csv.parseFile(assets.withHeaders.path, { headers: true }).transform(() => {
                throw new Error('transformation ERROR!!!!');
            });
            listenForError(stream, 'transformation ERROR!!!!', next);
        });

        it('should throw an error if a transform is not called with a function', () => {
            // @ts-ignore
            expect(() => csv.parse({ headers: true }).transform('hello')).toThrowError(
                'The transform should be a function',
            );
        });
    });

    describe('pause/resume', () => {
        it('should support pausing a stream', () => {
            assets.write(assets.withHeaders);
            return new Promise((res, rej) => {
                const rows: csv.ParserRow[] = [];
                let paused = false;
                const stream = csv.parse({ headers: true });
                fs.createReadStream(assets.withHeaders.path)
                    .on('error', rej)
                    .pipe(stream)
                    .on('data', row => {
                        expect(paused).toBe(false);
                        rows.push(row);
                        paused = true;
                        stream.pause();
                        setTimeout(() => {
                            expect(paused).toBe(true);
                            paused = false;
                            stream.resume();
                        }, 100);
                    })
                    .on('error', rej)
                    .on('end', (count: number) => {
                        expect(rows).toEqual(assets.withHeaders.parsed);
                        expect(count).toBe(rows.length);
                        res();
                    });
            });
        });
    });

    it('should not catch errors thrown in end', next => {
        assets.write(assets.withHeaders);
        const d = domain.create();
        let called = false;
        d.on('error', err => {
            d.exit();
            if (called) {
                throw err;
            }
            called = true;
            expect(err.message).toBe('End error');
            next();
        });
        d.run(() =>
            fs
                .createReadStream(assets.withHeaders.path)
                .on('error', next)
                .pipe(csv.parse({ headers: true }))
                .on('error', () => next(new Error('Should not get here!')))
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                .on('data', () => {})
                .on('end', () => {
                    throw new Error('End error');
                }),
        );
    });

    describe('.parseStream', () => {
        it('should accept a stream', async () => {
            assets.write(assets.withHeaders);
            const stream = csv.parseStream(fs.createReadStream(assets.withHeaders.path), { headers: true });
            await expectParsed(collectData(stream), assets.withHeaders.parsed);
        });
    });

    describe('.parseFile', () => {
        it('parse a csv from the given path', async () => {
            assets.write(assets.withHeaders);
            const stream = csv.parseFile(assets.withHeaders.path, { headers: true });
            await expectParsed(collectData(stream), assets.withHeaders.parsed);
        });
    });

    describe('.parseString', () => {
        it('should accept a csv string', () =>
            expectParsed(
                collectData(csv.parseString(assets.withHeaders.content, { headers: true })),
                assets.withHeaders.parsed,
            ));
    });
});
