import * as fs from 'fs';
import * as domain from 'domain';
import partition from 'lodash.partition';
import {
    ParserOptions,
    CsvParserStream,
    parseFile,
    ParserOptionsArgs,
    Row,
    RowMap,
    RowValidateCallback,
    HeaderArray,
} from '../src';
import {
    PathAndContent,
    ParseResults,
    expectParsed,
    parseContentAndCollectFromStream,
    write,
    duplicateHeaders,
    headerColumnMismatch,
    noHeadersAndQuotes,
    withHeaders,
    withHeadersAndAlternateQuote,
    withHeadersAndMissingColumns,
    withHeadersAndSkippedLines,
    withHeadersAndQuotes,
    alternateEncoding,
    trailingComma,
    emptyRows,
    withHeadersAlternateDelimiter,
    skipLines,
    malformed,
} from './__fixtures__';

describe('CsvParserStream', () => {
    const createParserStream = <I extends Row, O extends Row>(args?: ParserOptionsArgs): CsvParserStream<I, O> =>
        new CsvParserStream(new ParserOptions(args));

    const expectErrorEvent = <I extends Row, O extends Row>(
        stream: CsvParserStream<I, O>,
        message: string,
        resolve: () => void,
        reject: (err: Error) => void,
    ) => {
        let called = false;
        stream
            .on('error', (err: Error) => {
                expect(err.message).toBe(message);
                if (!called) {
                    called = true;
                    resolve();
                }
            })
            .on('end', () => reject(new Error(`Expected and error to occur [expectedMessage=${message}]`)));
    };

    const parseContentAndCollect = <R extends Row>(
        data: PathAndContent<R>,
        options: ParserOptionsArgs = {},
    ): Promise<ParseResults<R>> => parseContentAndCollectFromStream(data, createParserStream(options));

    it('should parse a csv without quotes or escapes', () =>
        expectParsed(parseContentAndCollect(withHeaders, { headers: true }), withHeaders.parsed));

    it('should emit a readable event', () =>
        new Promise((res, rej) => {
            const actual: Row[] = [];
            const parser = createParserStream({ headers: true });
            const stream = parser.on('error', rej).on('end', (count: number) => {
                expect(actual).toEqual(withHeaders.parsed);
                expect(count).toBe(actual.length);
                res();
            });
            let index = 0;
            stream.on('readable', () => {
                for (let data = stream.read() as Row | null; data !== null; data = stream.read() as Row | null) {
                    actual[index] = data;
                    index += 1;
                }
            });
            stream.write(withHeaders.content);
            stream.end();
        }));

    it('should emit data as a buffer if objectMode is false', async () => {
        const expected = withHeaders.parsed.map((r) => Buffer.from(JSON.stringify(r)));
        await expectParsed(parseContentAndCollect(withHeaders, { headers: true, objectMode: false }), expected);
    });

    it('should emit data as an object if objectMode is true', () =>
        expectParsed(parseContentAndCollect(withHeaders, { headers: true, objectMode: true }), withHeaders.parsed));

    it('should emit data as an object if objectMode is not specified', () =>
        expectParsed(parseContentAndCollect(withHeaders, { headers: true }), withHeaders.parsed));

    it('should parse a csv with quotes', () =>
        expectParsed(parseContentAndCollect(withHeadersAndQuotes, { headers: true }), withHeadersAndQuotes.parsed));

    it('should parse a csv with without headers', () =>
        expectParsed(parseContentAndCollect(noHeadersAndQuotes), noHeadersAndQuotes.parsed));

    it("should parse a csv with ' escapes", () =>
        expectParsed(
            parseContentAndCollect(withHeadersAndAlternateQuote, { headers: true, quote: "'" }),
            withHeadersAndAlternateQuote.parsed,
        ));

    describe('headers option', () => {
        it('should allow specifying of headers', async () => {
            const expected = noHeadersAndQuotes.parsed.map((r) => ({
                first_name: r[0],
                last_name: r[1],
                email_address: r[2],
                address: r[3],
            }));
            await expectParsed(
                parseContentAndCollect(noHeadersAndQuotes, {
                    headers: ['first_name', 'last_name', 'email_address', 'address'],
                }),
                expected,
            );
        });

        it('should allow transforming headers with a function', async () => {
            const expected = withHeadersAndQuotes.parsed.map((r) => ({
                firstName: r.first_name,
                lastName: r.last_name,
                emailAddress: r.email_address,
                address: r.address,
            }));
            const transform = jest.fn().mockReturnValue(['firstName', 'lastName', 'emailAddress', 'address']);
            await expectParsed(parseContentAndCollect(withHeadersAndQuotes, { headers: transform }), expected);
            expect(transform).toHaveBeenCalledTimes(1);
            expect(transform).toHaveBeenCalledWith(['first_name', 'last_name', 'email_address', 'address']);
        });

        describe('renameHeaders option', () => {
            it('should allow renaming headers', async () => {
                const expected = withHeadersAndQuotes.parsed.map((r) => ({
                    firstName: r.first_name,
                    lastName: r.last_name,
                    emailAddress: r.email_address,
                    address: r.address,
                }));
                await expectParsed(
                    parseContentAndCollect(withHeadersAndQuotes, {
                        headers: ['firstName', 'lastName', 'emailAddress', 'address'],
                        renameHeaders: true,
                    }),
                    expected,
                );
            });

            it('should ignore the renameHeaders option if transforming headers with a function', async () => {
                const expected = withHeadersAndQuotes.parsed.map((r) => ({
                    firstName: r.first_name,
                    lastName: r.last_name,
                    emailAddress: r.email_address,
                    address: r.address,
                }));
                const transform = jest.fn().mockReturnValue(['firstName', 'lastName', 'emailAddress', 'address']);
                await expectParsed(
                    parseContentAndCollect(withHeadersAndQuotes, { headers: transform, renameHeaders: true }),
                    expected,
                );
                expect(transform).toHaveBeenCalledTimes(1);
                expect(transform).toHaveBeenCalledWith(['first_name', 'last_name', 'email_address', 'address']);
            });

            it('should propagate an error when trying to rename headers without providing new ones', () =>
                new Promise((res, rej) => {
                    const stream = createParserStream({ renameHeaders: true });
                    expectErrorEvent(
                        stream,
                        'Error renaming headers: new headers must be provided in an array',
                        res,
                        rej,
                    );
                    stream.write(withHeadersAndQuotes.content);
                    stream.end();
                }));

            it('should propagate an error when trying to rename headers without providing proper ones', () =>
                new Promise((res, rej) => {
                    const stream = createParserStream({ renameHeaders: true, headers: true });
                    expectErrorEvent(
                        stream,
                        'Error renaming headers: new headers must be provided in an array',
                        res,
                        rej,
                    );
                    stream.write(withHeadersAndQuotes.content);
                    stream.end();
                }));
        });

        it('should propagate an error header length does not match column length', () =>
            new Promise((res, rej) => {
                const stream = createParserStream({ headers: true });
                expectErrorEvent(
                    stream,
                    'Unexpected Error: column header mismatch expected: 4 columns got: 5',
                    res,
                    rej,
                );
                stream.write(headerColumnMismatch.content);
                stream.end();
            }));

        it('should propagate an error if headers are not unique', () =>
            new Promise((res, rej) => {
                const stream = createParserStream({ headers: true });
                expectErrorEvent(stream, 'Duplicate headers found ["first_name"]', res, rej);
                stream.write(duplicateHeaders.content);
                stream.end();
            }));

        it('should discard extra columns that do not map to a header when discardUnmappedColumns is true', () =>
            expectParsed(
                parseContentAndCollect(headerColumnMismatch, { headers: true, discardUnmappedColumns: true }),
                headerColumnMismatch.parsed,
            ));

        it('should report missing columns that do not exist but have a header with strictColumnHandling option', async () => {
            const expectedRows = withHeadersAndMissingColumns.parsed?.filter((r) => r.address !== null);
            const expectedInvalidRows = withHeadersAndMissingColumns.parsed
                .filter((r) => r.address === null)
                .map((r) => Object.values(r).filter((v) => !!v));
            await expectParsed(
                parseContentAndCollect(withHeadersAndMissingColumns, {
                    headers: true,
                    strictColumnHandling: true,
                }),
                expectedRows,
                expectedInvalidRows,
            );
        });

        it('should allow specifying of columns as a sparse array', async () => {
            const expected = noHeadersAndQuotes.parsed.map((r) => ({
                first_name: r[0],
                email_address: r[2],
            }));
            await expectParsed(
                parseContentAndCollect(noHeadersAndQuotes, {
                    headers: ['first_name', undefined, 'email_address', undefined],
                }),
                expected,
            );
        });
    });

    it('should parse data with an alternate encoding', () =>
        expectParsed(
            parseContentAndCollect(alternateEncoding, { headers: true, encoding: 'utf16le' }),
            alternateEncoding.parsed,
        ));

    it('should handle a trailing comma', () =>
        expectParsed(parseContentAndCollect(trailingComma, { headers: true }), trailingComma.parsed));

    it('should skip valid, but empty rows when ignoreEmpty is true', () =>
        expectParsed(parseContentAndCollect(emptyRows, { headers: true, ignoreEmpty: true }), []));

    describe('alternate delimiters', () => {
        ['\t', '|', ';'].forEach((delimiter) => {
            it(`should support '${delimiter.replace(/\t/, '\\t')}' delimiters`, async () => {
                const asset = withHeadersAlternateDelimiter(delimiter);
                await expectParsed(parseContentAndCollect(asset, { headers: true, delimiter }), asset.parsed);
            });
        });
    });

    describe('maxRows option', () => {
        it('should parse up to the specified number of maxRows', async () => {
            const maxRows = 3;
            await expectParsed(
                parseContentAndCollect(withHeaders, { headers: true, maxRows }),
                withHeaders.parsed.slice(0, maxRows),
            );
        });

        it('should parse all rows if maxRows === 0', async () => {
            const maxRows = 0;
            await expectParsed(parseContentAndCollect(withHeaders, { headers: true, maxRows }), withHeaders.parsed);
        });
    });

    describe('skipLines option', () => {
        it('should skip up to the specified number of rows using the first non-skipped line as headers', async () => {
            const linesToSkip = 2;
            await expectParsed(
                parseContentAndCollect(withHeadersAndSkippedLines, { headers: true, skipLines: linesToSkip }),
                withHeadersAndSkippedLines.parsed,
            );
        });

        it('should skip up to the specified number of rows not withoutHeaders', async () => {
            const linesToSkip = 2;
            await expectParsed(parseContentAndCollect(skipLines, { skipLines: linesToSkip }), skipLines.parsed);
        });

        describe('with transform', () => {
            it('should not transform skipped rows', async () => {
                let transformedRows: Row[] = [];
                const transformer = (row: RowMap<string>): RowMap => {
                    const transformed = {
                        firstName: row.first_name,
                        lastName: row.last_name,
                        emailAddress: row.email_address,
                    };
                    transformedRows.push(transformed);
                    return transformed;
                };
                const linesToSkip = 2;
                const expected = withHeadersAndSkippedLines.parsed.map(transformer);
                transformedRows = [];
                const parser = createParserStream<RowMap, RowMap>({ headers: true, skipLines: linesToSkip }).transform(
                    transformer,
                );
                await expectParsed(parseContentAndCollectFromStream(withHeadersAndSkippedLines, parser), expected);
                expect(transformedRows).toEqual(expected);
            });
        });

        describe('with validate', () => {
            it('should not validate skipped rows', async () => {
                let validatedRows: Row[] = [];
                const validator = (row: Row): boolean => {
                    validatedRows.push(row);
                    return (validatedRows.length - 1) % 2 === 0;
                };
                const linesToSkip = 2;
                const nonSkippedRows = withHeadersAndSkippedLines.parsed;
                const [expected, invalid] = partition(nonSkippedRows, validator);
                validatedRows = [];
                const parser = createParserStream({ headers: true, skipLines: linesToSkip }).validate(validator);
                await expectParsed(
                    parseContentAndCollectFromStream(withHeadersAndSkippedLines, parser),
                    expected,
                    invalid,
                );
                expect(validatedRows).toEqual(nonSkippedRows);
            });
        });

        it('should parse all rows if maxRows === 0', async () => {
            const linesToSkip = 0;
            await expectParsed(
                parseContentAndCollect(withHeaders, { headers: true, skipLines: linesToSkip }),
                withHeaders.parsed,
            );
        });
    });

    describe('skipRows option', () => {
        describe('with headers', () => {
            it('should skip up to the specified number of rows not including the header row in the count', async () => {
                const skipRows = 3;
                await expectParsed(
                    parseContentAndCollect(withHeaders, { headers: true, skipRows }),
                    withHeaders.parsed.slice(skipRows),
                );
            });

            it('should skip up to the specified number of rows and allow renaming the headers', async () => {
                const skipRows = 3;
                const expected = withHeaders.parsed.slice(skipRows).map((r) => ({
                    h1: r.first_name,
                    h2: r.last_name,
                    h3: r.email_address,
                }));
                await expectParsed(
                    parseContentAndCollect(withHeaders, {
                        headers: ['h1', 'h2', 'h3'],
                        renameHeaders: true,
                        skipRows,
                    }),
                    expected,
                );
            });

            describe('strict column handling', () => {
                it('should include the invalid rows when counting rows to skip', async () => {
                    const expectedRows = withHeadersAndMissingColumns.parsed;
                    await expectParsed(
                        parseContentAndCollect(withHeadersAndMissingColumns, {
                            headers: true,
                            strictColumnHandling: true,
                            skipRows: 2,
                        }),
                        expectedRows.slice(-1),
                        [],
                    );
                });
            });
        });

        describe('without headers', () => {
            it('should skip up to the specified number of rows without headers', async () => {
                const skipRows = 3;
                const expected = noHeadersAndQuotes.parsed.slice(skipRows);
                await expectParsed(parseContentAndCollect(noHeadersAndQuotes, { skipRows }), expected);
            });

            it('should skip up to the specified number of rows without headers and allow specifying headers', async () => {
                const skipRows = 3;
                const expected = noHeadersAndQuotes.parsed.slice(skipRows).map((r) => ({
                    h1: r[0],
                    h2: r[1],
                    h3: r[2],
                    h4: r[3],
                }));
                await expectParsed(
                    parseContentAndCollect(noHeadersAndQuotes, { headers: ['h1', 'h2', 'h3', 'h4'], skipRows }),
                    expected,
                );
            });
        });

        describe('with transform', () => {
            it('should not transform skipped rows', async () => {
                let transformedRows: Row[] = [];
                const transformer = (row: RowMap<string>): RowMap => {
                    const transformed = {
                        firstName: row.first_name,
                        lastName: row.last_name,
                        emailAddress: row.email_address,
                        address: row.address,
                    };
                    transformedRows.push(transformed);
                    return transformed;
                };
                const skipRows = 3;
                const expected = withHeaders.parsed.slice(skipRows).map(transformer);
                transformedRows = [];
                const parser = createParserStream<RowMap, RowMap>({ headers: true, skipRows }).transform(transformer);
                await expectParsed(parseContentAndCollectFromStream(withHeaders, parser), expected);
                expect(transformedRows).toEqual(expected);
            });
        });

        describe('with validate', () => {
            it('should not validate skipped rows', async () => {
                let validatedRows: Row[] = [];
                const validator = (row: Row): boolean => {
                    validatedRows.push(row);
                    return (validatedRows.length - 1) % 2 === 0;
                };
                const skipRows = 3;
                const nonSkippedRows = withHeaders.parsed.slice(skipRows);
                const [expected, invalid] = partition(nonSkippedRows, validator);
                validatedRows = [];
                const parser = createParserStream({ headers: true, skipRows }).validate(validator);
                await expectParsed(parseContentAndCollectFromStream(withHeaders, parser), expected, invalid);
                expect(validatedRows).toEqual(nonSkippedRows);
            });
        });

        it('should parse all rows if maxRows === 0', async () => {
            const skipRows = 0;
            await expectParsed(parseContentAndCollect(withHeaders, { headers: true, skipRows }), withHeaders.parsed);
        });
    });

    it('should emit an error for malformed rows', () =>
        new Promise((res, rej) => {
            write(malformed);
            const stream = parseFile(malformed.path, { headers: true });
            expectErrorEvent(stream, "Parse Error: expected: ',' OR new line got: 'a'. at 'a   \", Las'", res, rej);
        }));

    describe('headers event', () => {
        it('should emit a headers event one time when headers are discovered', async () => {
            const parsedHeaders: string[] = [];
            let eventCount = 0;
            const stream = createParserStream({ headers: true });
            stream.on('headers', (hs) => {
                eventCount += 1;
                parsedHeaders.push(...hs);
            });
            await expectParsed(parseContentAndCollectFromStream(withHeaders, stream), withHeaders.parsed);
            expect(eventCount).toBe(1);
            expect(parsedHeaders).toEqual(['first_name', 'last_name', 'email_address']);
        });

        it('should emit a headers event one time with transformed headers', async () => {
            const parsedHeaders: string[] = [];
            let eventCount = 0;
            const headersTransform = (hs: HeaderArray): HeaderArray => hs.map((h) => h?.toUpperCase());
            const stream = createParserStream({ headers: headersTransform });
            stream.on('headers', (hs) => {
                eventCount += 1;
                parsedHeaders.push(...hs);
            });
            await expectParsed(
                parseContentAndCollectFromStream(withHeaders, stream),
                withHeaders.parsed.map((r) => ({
                    FIRST_NAME: r.first_name,
                    LAST_NAME: r.last_name,
                    EMAIL_ADDRESS: r.email_address,
                })),
            );
            expect(eventCount).toBe(1);
            expect(parsedHeaders).toEqual(['FIRST_NAME', 'LAST_NAME', 'EMAIL_ADDRESS']);
        });

        it('should emit a headers provided headers', async () => {
            const parsedHeaders: string[] = [];
            let eventCount = 0;
            const headers = ['first_name', 'last_name', 'email_address', 'address'];
            const stream = createParserStream({ headers });
            stream.on('headers', (hs) => {
                eventCount += 1;
                parsedHeaders.push(...hs);
            });
            const expected = noHeadersAndQuotes.parsed.map((r) => ({
                first_name: r[0],
                last_name: r[1],
                email_address: r[2],
                address: r[3],
            }));
            await expectParsed(parseContentAndCollectFromStream(noHeadersAndQuotes, stream), expected);
            expect(eventCount).toBe(1);
            expect(parsedHeaders).toEqual(headers);
        });

        it('should not a headers provided headers', async () => {
            const parsedHeaders: string[] = [];
            let eventCount = 0;
            const stream = createParserStream();
            stream.on('headers', (hs) => {
                eventCount += 1;
                parsedHeaders.push(...hs);
            });
            await expectParsed(parseContentAndCollectFromStream(noHeadersAndQuotes, stream), noHeadersAndQuotes.parsed);
            expect(eventCount).toBe(0);
            expect(parsedHeaders).toHaveLength(0);
        });
    });

    describe('#validate', () => {
        const syncValidator = (row: RowMap<string>): boolean =>
            parseInt(row.first_name ? row.first_name.replace(/^First/, '') : '0', 10) % 2 === 1;
        const asyncValidator = (row: RowMap, cb: RowValidateCallback) => {
            cb(null, syncValidator(row));
        };

        it('should allow validation of rows', async () => {
            const [valid, invalid] = partition(withHeaders.parsed, syncValidator);
            const parser = createParserStream<RowMap, RowMap>({ headers: true }).validate(syncValidator);
            await expectParsed(parseContentAndCollectFromStream(withHeaders, parser), valid, invalid);
        });

        it('should allow async validation of rows', async () => {
            const validator = (row: RowMap<string>): boolean =>
                parseInt(row.first_name ? row.first_name.replace(/^First/, '') : '0', 10) % 2 === 1;
            const [valid, invalid] = partition(withHeaders.parsed, validator);
            const parser = createParserStream<RowMap, RowMap>({ headers: true }).validate(asyncValidator);
            await expectParsed(parseContentAndCollectFromStream(withHeaders, parser), valid, invalid);
        });

        it('should propagate errors from async validation', () =>
            new Promise((res, rej) => {
                write(withHeaders);
                let index = -1;
                const stream = createParserStream({ headers: true }).validate((data: Row, validateNext): void => {
                    setImmediate(() => {
                        index += 1;
                        if (index === 8) {
                            validateNext(new Error('Validation ERROR!!!!'));
                        } else {
                            validateNext(null, true);
                        }
                    });
                });
                stream.write(withHeaders.content);
                stream.end();
                expectErrorEvent(stream, 'Validation ERROR!!!!', res, rej);
            }));

        it('should propagate async errors at the beginning', () =>
            new Promise((res, rej) => {
                write(withHeaders);
                const stream = parseFile<RowMap, RowMap>(withHeaders.path, {
                    headers: true,
                }).validate((data: RowMap, validateNext) => validateNext(new Error('Validation ERROR!!!!')));
                expectErrorEvent(stream, 'Validation ERROR!!!!', res, rej);
            }));

        it('should propagate thrown errors', () =>
            new Promise((res, rej) => {
                write(withHeaders);
                let index = -1;
                const stream = parseFile(withHeaders.path, { headers: true }).validate((data, validateNext) => {
                    index += 1;
                    if (index === 8) {
                        throw new Error('Validation ERROR!!!!');
                    } else {
                        setImmediate(() => validateNext(null, true));
                    }
                });
                expectErrorEvent(stream, 'Validation ERROR!!!!', res, rej);
            }));

        it('should propagate thrown errors at the beginning', () =>
            new Promise((res, rej) => {
                write(withHeaders);
                const stream = parseFile(withHeaders.path, { headers: true }).validate(() => {
                    throw new Error('Validation ERROR!!!!');
                });
                expectErrorEvent(stream, 'Validation ERROR!!!!', res, rej);
            }));

        it('should throw an error if validate is not called with a function', () => {
            // @ts-ignore
            expect(() => createParserStream({ headers: true }).validate('hello')).toThrow(
                'The validate should be a function',
            );
        });
    });

    describe('#transform', () => {
        const transformer = (row: RowMap<string>): RowMap => ({
            firstName: row.first_name,
            lastName: row.last_name,
            emailAddress: row.email_address,
            address: row.address,
        });

        it('should allow transforming of data', async () => {
            const expected = withHeaders.parsed.map(transformer);
            const parser = createParserStream<RowMap, RowMap>({ headers: true }).transform(transformer);
            await expectParsed(parseContentAndCollectFromStream(withHeaders, parser), expected);
        });

        it('should async transformation of data', async () => {
            const expected = withHeaders.parsed.map(transformer);
            const parser = createParserStream<RowMap, RowMap>({ headers: true }).transform((row, next) =>
                setImmediate(() => next(null, transformer(row))),
            );
            await expectParsed(parseContentAndCollectFromStream(withHeaders, parser), expected);
        });

        it('should propogate errors when transformation of data', () =>
            new Promise((res, rej) => {
                write(withHeaders);
                let index = -1;
                const stream = parseFile<RowMap, RowMap>(withHeaders.path, { headers: true }).transform(
                    (data: RowMap, cb) =>
                        setImmediate(() => {
                            index += 1;
                            if (index === 8) {
                                cb(new Error('transformation ERROR!!!!'));
                            } else {
                                cb(null, transformer(data));
                            }
                        }),
                );
                expectErrorEvent(stream, 'transformation ERROR!!!!', res, rej);
            }));

        it('should propogate errors when transformation of data at the beginning', () =>
            new Promise((res, rej) => {
                write(withHeaders);
                const stream = parseFile(withHeaders.path, { headers: true }).transform((data, cb) =>
                    setImmediate(() => cb(new Error('transformation ERROR!!!!'))),
                );
                expectErrorEvent(stream, 'transformation ERROR!!!!', res, rej);
            }));

        it('should propagate thrown errors at the end', () =>
            new Promise((res, rej) => {
                write(withHeaders);
                let index = -1;
                const stream = parseFile(withHeaders.path, { headers: true }).transform((data, cb) => {
                    index += 1;
                    if (index === 8) {
                        throw new Error('transformation ERROR!!!!');
                    } else {
                        setImmediate(() => cb(null, data));
                    }
                });
                expectErrorEvent(stream, 'transformation ERROR!!!!', res, rej);
            }));

        it('should propagate thrown errors at the beginning', () =>
            new Promise((res, rej) => {
                write(withHeaders);
                const stream = parseFile(withHeaders.path, { headers: true }).transform(() => {
                    throw new Error('transformation ERROR!!!!');
                });
                expectErrorEvent(stream, 'transformation ERROR!!!!', res, rej);
            }));

        it('should throw an error if a transform is not called with a function', () => {
            // @ts-ignore
            expect(() => createParserStream({ headers: true }).transform('hello')).toThrow(
                'The transform should be a function',
            );
        });
    });

    describe('pause/resume', () => {
        it('should support pausing a stream', () => {
            write(withHeaders);
            return new Promise((res, rej) => {
                const rows: Row[] = [];
                let paused = false;
                const stream = createParserStream({ headers: true });
                fs.createReadStream(withHeaders.path)
                    .on('error', rej)
                    .pipe(stream)
                    .on('data', (row) => {
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
                        expect(rows).toEqual(withHeaders.parsed);
                        expect(count).toBe(rows.length);
                        res();
                    });
            });
        });
    });

    it('should not catch errors thrown in end', () =>
        new Promise((res, rej) => {
            write(withHeaders);
            const d = domain.create();
            let called = false;
            d.on('error', (err: Error) => {
                d.exit();
                if (called) {
                    throw err;
                }
                called = true;
                expect(err.message).toBe('End error');
                res();
            });
            d.run(() =>
                fs
                    .createReadStream(withHeaders.path)
                    .on('error', rej)
                    .pipe(createParserStream({ headers: true }))
                    .on('error', () => rej(new Error('Should not get here!')))
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    .on('data', () => {})
                    .on('end', () => {
                        throw new Error('End error');
                    }),
            );
        }));
});
