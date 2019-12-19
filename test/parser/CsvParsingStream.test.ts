/* eslint-disable no-cond-assign,@typescript-eslint/camelcase */
import * as assert from 'assert';
import * as fs from 'fs';
import * as domain from 'domain';
import * as sinon from 'sinon';
import partition from 'lodash.partition';
import * as csv from '../../src';
import assets, { PathAndContent } from './assets';
import { CsvParserStream } from '../../src/parser';

import Done = Mocha.Done;

describe('CsvParserStream', () => {
    const listenForError = (stream: CsvParserStream, message: string, next: Done) => {
        let called = false;
        stream
            .on('error', (err: Error) => {
                assert.strictEqual(err.message, message);
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

    it('should parse a csv without quotes or escapes', () =>
        parseContentAndCollect(assets.withHeaders, { headers: true }).then(({ count, rows }) => {
            assert.deepStrictEqual(rows, assets.withHeaders.parsed);
            assert.strictEqual(count, rows.length);
        }));

    it('should emit a readable event ', next => {
        const actual: csv.ParserRow[] = [];
        const parser = csv.parse({ headers: true });
        const stream = parser.on('error', next).on('end', (count: number) => {
            assert.deepStrictEqual(actual, assets.withHeaders.parsed);
            assert.strictEqual(count, actual.length);
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

    it('should emit data as a buffer if objectMode is false', () => {
        const expected = assets.withHeaders.parsed.map(r => Buffer.from(JSON.stringify(r)));
        return parseContentAndCollect(assets.withHeaders, { headers: true, objectMode: false }).then(
            ({ count, rows }) => {
                assert.deepStrictEqual(rows, expected);
                assert.strictEqual(count, rows.length);
            },
        );
    });

    it('should emit data as an object if objectMode is true', () =>
        parseContentAndCollect(assets.withHeaders, { headers: true, objectMode: true }).then(({ count, rows }) => {
            assert.deepStrictEqual(rows, assets.withHeaders.parsed);
            assert.strictEqual(count, rows.length);
        }));

    it('should emit data as an object if objectMode is not specified', () =>
        parseContentAndCollect(assets.withHeaders, { headers: true }).then(({ count, rows }) => {
            assert.deepStrictEqual(rows, assets.withHeaders.parsed);
            assert.strictEqual(count, rows.length);
        }));

    it('should parse a csv with quotes', () =>
        parseContentAndCollect(assets.withHeadersAndQuotes, { headers: true }).then(({ count, rows }) => {
            assert.deepStrictEqual(rows, assets.withHeadersAndQuotes.parsed);
            assert.strictEqual(count, rows.length);
        }));

    it('should parse a csv with without headers', () =>
        parseContentAndCollect(assets.noHeadersAndQuotes).then(({ count, rows }) => {
            assert.deepStrictEqual(rows, assets.noHeadersAndQuotes.parsed);
            assert.strictEqual(count, rows.length);
        }));

    it("should parse a csv with ' escapes", () =>
        parseContentAndCollect(assets.withHeadersAndAlternateQuote, { headers: true, quote: "'" }).then(
            ({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.withHeadersAndAlternateQuote.parsed);
                assert.strictEqual(count, rows.length);
            },
        ));

    describe('headers option', () => {
        it('should allow specifying of headers', () => {
            const expected = assets.noHeadersAndQuotes.parsed.map(r => ({
                first_name: r[0],
                last_name: r[1],
                email_address: r[2],
                address: r[3],
            }));
            return parseContentAndCollect(assets.noHeadersAndQuotes, {
                headers: ['first_name', 'last_name', 'email_address', 'address'],
            }).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, expected);
                assert.strictEqual(count, rows.length);
            });
        });

        it('should allow transforming headers with a function', () => {
            const expected = assets.withHeadersAndQuotes.parsed.map(r => ({
                firstName: r.first_name,
                lastName: r.last_name,
                emailAddress: r.email_address,
                address: r.address,
            }));
            const transform = sinon.stub().returns(['firstName', 'lastName', 'emailAddress', 'address']);
            return parseContentAndCollect(assets.withHeadersAndQuotes, {
                headers: transform,
            }).then(({ count, rows }) => {
                sinon.assert.calledOnce(transform);
                sinon.assert.calledWith(transform, ['first_name', 'last_name', 'email_address', 'address']);
                assert.deepStrictEqual(rows, expected);
                assert.strictEqual(count, rows.length);
            });
        });

        describe('renameHeaders option', () => {
            it('should allow renaming headers', () => {
                const expected = assets.withHeadersAndQuotes.parsed.map(r => ({
                    firstName: r.first_name,
                    lastName: r.last_name,
                    emailAddress: r.email_address,
                    address: r.address,
                }));
                return parseContentAndCollect(assets.withHeadersAndQuotes, {
                    headers: ['firstName', 'lastName', 'emailAddress', 'address'],
                    renameHeaders: true,
                }).then(({ count, rows }) => {
                    assert.deepStrictEqual(rows, expected);
                    assert.strictEqual(count, rows.length);
                });
            });

            it('should ignore the renameHeaders option if transforming headers with a function', () => {
                const expected = assets.withHeadersAndQuotes.parsed.map(r => ({
                    firstName: r.first_name,
                    lastName: r.last_name,
                    emailAddress: r.email_address,
                    address: r.address,
                }));
                const transform = sinon.stub().returns(['firstName', 'lastName', 'emailAddress', 'address']);
                return parseContentAndCollect(assets.withHeadersAndQuotes, {
                    headers: transform,
                    renameHeaders: true,
                }).then(({ count, rows }) => {
                    sinon.assert.calledOnce(transform);
                    sinon.assert.calledWith(transform, ['first_name', 'last_name', 'email_address', 'address']);
                    assert.deepStrictEqual(rows, expected);
                    assert.strictEqual(count, rows.length);
                });
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

        it('should discard extra columns that do not map to a header when discardUnmappedColumns is true', () =>
            parseContentAndCollect(assets.headerColumnMismatch, { headers: true, discardUnmappedColumns: true }).then(
                ({ count, rows }) => {
                    assert.deepStrictEqual(rows, assets.headerColumnMismatch.parsed);
                    assert.strictEqual(count, rows.length);
                },
            ));

        it('should report missing columns that do not exist but have a header with strictColumnHandling option', () => {
            const expectedRows = assets.withHeadersAndMissingColumns.parsed.filter(r => r.address !== null);
            const expectedInvalidRows = assets.withHeadersAndMissingColumns.parsed
                .filter(r => r.address === null)
                .map(r => Object.values(r).filter(v => !!v));
            return parseContentAndCollect(assets.withHeadersAndMissingColumns, {
                headers: true,
                strictColumnHandling: true,
            }).then(({ count, rows, invalidRows }) => {
                assert.deepStrictEqual(rows, expectedRows);
                assert.deepStrictEqual(invalidRows, expectedInvalidRows);
                assert.strictEqual(count, rows.length + invalidRows.length);
            });
        });

        it('should allow specifying of columns as a sparse array', () => {
            const expected = assets.noHeadersAndQuotes.parsed.map(r => ({
                first_name: r[0],
                email_address: r[2],
            }));
            return parseContentAndCollect(assets.noHeadersAndQuotes, {
                headers: ['first_name', undefined, 'email_address', undefined],
            }).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, expected);
                assert.strictEqual(count, rows.length);
            });
        });
    });

    it('should parse data with an alternate encoding', () =>
        parseContentAndCollect(assets.alternateEncoding, { headers: true, encoding: 'utf16le' }).then(
            ({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.alternateEncoding.parsed);
                assert.strictEqual(count, rows.length);
            },
        ));

    it('should handle a trailing comma', () =>
        parseContentAndCollect(assets.trailingComma, { headers: true }).then(({ count, rows }) => {
            assert.deepStrictEqual(rows, assets.trailingComma.parsed);
            assert.strictEqual(count, rows.length);
        }));

    it('should skip valid, but empty rows when ignoreEmpty is true', () =>
        parseContentAndCollect(assets.emptyRows, { headers: true, ignoreEmpty: true }).then(
            ({ count, rows, invalidRows }) => {
                assert.strictEqual(count, 0);
                assert.deepStrictEqual(rows, []);
                assert.deepStrictEqual(invalidRows, []);
            },
        ));

    describe('alternate delimiters', () => {
        ['\t', '|', ';'].forEach(delimiter => {
            it(`should support '${delimiter.replace(/\t/, '\\t')}' delimiters`, () => {
                const { path: assetPath, content } = assets.withHeadersAlternateDelimiter;
                const data = {
                    path: assetPath,
                    content: content(delimiter),
                };
                return parseContentAndCollect(data, { headers: true, delimiter }).then(({ count, rows }) => {
                    assert.deepStrictEqual(rows, assets.withHeadersAlternateDelimiter.parsed);
                    assert.strictEqual(count, rows.length);
                });
            });
        });
    });

    describe('maxRows option', () => {
        it('should parse up to the specified number of maxRows', () => {
            const maxRows = 3;
            return parseContentAndCollect(assets.withHeaders, { headers: true, maxRows }).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.withHeaders.parsed.slice(0, maxRows));
                assert.strictEqual(count, maxRows);
            });
        });

        it('should parse all rows if maxRows === 0', () => {
            const maxRows = 0;
            return parseContentAndCollect(assets.withHeaders, { headers: true, maxRows }).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.withHeaders.parsed);
                assert.strictEqual(count, rows.length);
            });
        });
    });

    describe('skipLines option', () => {
        it('should skip up to the specified number of rows using the first non-skipped line as headers', () => {
            const skipLines = 2;
            return parseContentAndCollect(assets.withHeadersSkippedLines, {
                headers: true,
                skipLines,
            }).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.withHeadersSkippedLines.parsed);
                assert.strictEqual(count, rows.length);
            });
        });

        it('should skip up to the specified number of rows not withoutHeaders', () => {
            const skipLines = 2;
            return parseContentAndCollect(assets.skipLines, { skipLines }).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.skipLines.parsed);
                assert.strictEqual(count, rows.length);
            });
        });

        describe('with transform', () => {
            it('should not transform skipped rows', () => {
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
                return parseContentAndCollectFromStream(assets.withHeadersSkippedLines, parser).then(
                    ({ count, rows }) => {
                        assert.deepStrictEqual(rows, expected);
                        assert.deepStrictEqual(transformedRows, expected);
                        assert.strictEqual(count, expected.length);
                    },
                );
            });
        });

        describe('with validate', () => {
            it('should not validate skipped rows', () => {
                let validatedRows: csv.ParserRow[] = [];
                const validator = (row: csv.ParserRow): boolean => {
                    validatedRows.push(row);
                    return (validatedRows.length - 1) % 2 === 0;
                };
                const skipLines = 2;
                const nonSkippedRows = assets.withHeadersSkippedLines.parsed;
                const expected = nonSkippedRows.filter(validator);
                validatedRows = [];
                const parser = csv.parse({ headers: true, skipLines }).validate(validator);
                return parseContentAndCollectFromStream(assets.withHeadersSkippedLines, parser).then(
                    ({ count, rows }) => {
                        assert.deepStrictEqual(rows, expected);
                        assert.deepStrictEqual(validatedRows, nonSkippedRows);
                        assert.strictEqual(count, nonSkippedRows.length);
                    },
                );
            });
        });

        it('should parse all rows if maxRows === 0', () => {
            const skipLines = 0;
            return parseContentAndCollect(assets.withHeaders, { headers: true, skipLines }).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.withHeaders.parsed);
                assert.strictEqual(count, rows.length);
            });
        });
    });

    describe('skipRows option', () => {
        describe('with headers', () => {
            it('should skip up to the specified number of rows not including the header row in the count', () => {
                const skipRows = 3;
                return parseContentAndCollect(assets.withHeaders, {
                    headers: true,
                    skipRows,
                }).then(({ count, rows }) => {
                    assert.deepStrictEqual(rows, assets.withHeaders.parsed.slice(skipRows));
                    assert.strictEqual(count, rows.length);
                });
            });

            it('should skip up to the specified number of rows and allow renaming the headers', () => {
                const skipRows = 3;
                return parseContentAndCollect(assets.withHeaders, {
                    headers: ['h1', 'h2', 'h3'],
                    renameHeaders: true,
                    skipRows,
                }).then(({ count, rows }) => {
                    assert.deepStrictEqual(
                        rows,
                        assets.withHeaders.parsed.slice(skipRows).map(r => {
                            return {
                                h1: r.first_name,
                                h2: r.last_name,
                                h3: r.email_address,
                            };
                        }),
                    );
                    assert.strictEqual(count, rows.length);
                });
            });
        });

        describe('without headers', () => {
            it('should skip up to the specified number of rows without headers', () => {
                const skipRows = 3;
                return parseContentAndCollect(assets.noHeadersAndQuotes, { skipRows }).then(({ count, rows }) => {
                    assert.deepStrictEqual(rows, assets.noHeadersAndQuotes.parsed.slice(skipRows));
                    assert.strictEqual(count, rows.length);
                });
            });

            it('should skip up to the specified number of rows without headers and allow specifying headers', () => {
                const skipRows = 3;
                return parseContentAndCollect(assets.noHeadersAndQuotes, {
                    headers: ['h1', 'h2', 'h3', 'h4'],
                    skipRows,
                }).then(({ count, rows }) => {
                    assert.deepStrictEqual(
                        rows,
                        assets.noHeadersAndQuotes.parsed.slice(skipRows).map(r => {
                            return {
                                h1: r[0],
                                h2: r[1],
                                h3: r[2],
                                h4: r[3],
                            };
                        }),
                    );
                    assert.strictEqual(count, rows.length);
                });
            });
        });

        describe('with transform', () => {
            it('should not transform skipped rows', () => {
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
                return parseContentAndCollectFromStream(assets.withHeaders, parser).then(({ count, rows }) => {
                    assert.deepStrictEqual(rows, expected);
                    assert.deepStrictEqual(transformedRows, expected);
                    assert.strictEqual(count, expected.length);
                });
            });
        });

        describe('with validate', () => {
            it('should not validate skipped rows', () => {
                let validatedRows: csv.ParserRow[] = [];
                const validator = (row: csv.ParserRow): boolean => {
                    validatedRows.push(row);
                    return (validatedRows.length - 1) % 2 === 0;
                };
                const skipRows = 3;
                const nonSkippedRows = assets.withHeaders.parsed.slice(skipRows);
                const expected = nonSkippedRows.filter(validator);
                validatedRows = [];
                const parser = csv.parse({ headers: true, skipRows }).validate(validator);
                return parseContentAndCollectFromStream(assets.withHeaders, parser).then(({ count, rows }) => {
                    assert.deepStrictEqual(rows, expected);
                    assert.deepStrictEqual(validatedRows, nonSkippedRows);
                    assert.strictEqual(count, nonSkippedRows.length);
                });
            });
        });

        it('should parse all rows if maxRows === 0', () => {
            const skipRows = 0;
            return parseContentAndCollect(assets.withHeaders, { headers: true, skipRows }).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.withHeaders.parsed);
                assert.strictEqual(count, rows.length);
            });
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

        it('should allow validation of rows', () => {
            const invalidValid = partition(assets.withHeaders.parsed, syncValidator);
            const parser = csv.parse({ headers: true }).validate(syncValidator);

            return parseContentAndCollectFromStream(assets.withHeaders, parser).then(({ count, rows, invalidRows }) => {
                assert.deepStrictEqual(invalidRows, invalidValid[1]);
                assert.deepStrictEqual(rows, invalidValid[0]);
                assert.strictEqual(count, invalidValid[0].length + invalidValid[1].length);
            });
        });

        it('should allow async validation of rows', () => {
            const validator = (row: csv.ParserRow): boolean =>
                parseInt((row as csv.ParserRowMap).first_name.replace(/^First/, ''), 10) % 2 !== 0;
            const invalidValid = partition(assets.withHeaders.parsed, validator);
            const parser = csv.parse({ headers: true }).validate(asyncValidator);

            return parseContentAndCollectFromStream(assets.withHeaders, parser).then(({ count, rows, invalidRows }) => {
                assert.deepStrictEqual(invalidRows, invalidValid[1]);
                assert.deepStrictEqual(rows, invalidValid[0]);
                assert.strictEqual(count, invalidValid[0].length + invalidValid[1].length);
            });
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
            assert.throws(() => {
                // @ts-ignore
                csv.parse({ headers: true }).validate('hello');
            }, /TypeError: The validate should be a function/);
        });
    });

    describe('#transform', () => {
        const transformer = (row: csv.ParserRow): csv.ParserRow => ({
            firstName: (row as csv.ParserRowMap).first_name,
            lastName: (row as csv.ParserRowMap).last_name,
            emailAddress: (row as csv.ParserRowMap).email_address,
            address: (row as csv.ParserRowMap).address,
        });

        it('should allow transforming of data', () => {
            const expected = assets.withHeaders.parsed.map(transformer);
            const parser = csv.parse({ headers: true }).transform(transformer);
            return parseContentAndCollectFromStream(assets.withHeaders, parser).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, expected);
                assert.strictEqual(count, expected.length);
            });
        });

        it('should async transformation of data', () => {
            const expected = assets.withHeaders.parsed.map(transformer);
            const parser = csv
                .parse({ headers: true })
                .transform((row, next) => setImmediate(() => next(null, transformer(row))));
            return parseContentAndCollectFromStream(assets.withHeaders, parser).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, expected);
                assert.strictEqual(count, expected.length);
            });
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
            assert.throws(() => {
                // @ts-ignore
                csv.parse({ headers: true }).transform('hello');
            }, /TypeError: The transform should be a function/);
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
                        assert.ok(!paused);
                        rows.push(row);
                        paused = true;
                        stream.pause();
                        setTimeout(() => {
                            assert.ok(paused);
                            paused = false;
                            stream.resume();
                        }, 100);
                    })
                    .on('error', rej)
                    .on('end', (count: number) => {
                        assert.deepStrictEqual(rows, assets.withHeaders.parsed);
                        assert.strictEqual(count, rows.length);
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
            assert.strictEqual(err.message, 'End error');
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
        it('should accept a stream', () => {
            assets.write(assets.withHeaders);
            const stream = csv.parseStream(fs.createReadStream(assets.withHeaders.path), { headers: true });
            return collectData(stream).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.withHeaders.parsed);
                assert.strictEqual(count, rows.length);
            });
        });
    });

    describe('.parseFile', () => {
        it('parse a csv from the given path', () => {
            assets.write(assets.withHeaders);
            const stream = csv.parseFile(assets.withHeaders.path, { headers: true });
            return collectData(stream).then(({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.withHeaders.parsed);
                assert.strictEqual(count, rows.length);
            });
        });
    });

    describe('.parseString', () => {
        it('should accept a csv string', next => {
            const actual: csv.ParserRow[] = [];
            csv.parseString(assets.withHeaders.content, { headers: true })
                .on('data', data => actual.push(data))
                .on('end', (count: number) => {
                    assert.deepStrictEqual(actual, assets.withHeaders.parsed);
                    assert.strictEqual(count, actual.length);
                    next();
                });
        });
    });
});
