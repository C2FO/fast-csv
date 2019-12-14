/* eslint-disable no-cond-assign,@typescript-eslint/camelcase */
import * as assert from 'assert';
import * as fs from 'fs';
import * as domain from 'domain';
import partition from 'lodash.partition';
import * as csv from '../../src';
import assets, { PathAndContent } from './assets';
import { CsvParserStream, ParserOptionsArgs, Row, RowMap, RowValidateCallback } from '../../src/parser';

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
        rows: Row[];
        invalidRows: Row[];
    }

    const collectData = (stream: CsvParserStream): Promise<ParseResults> =>
        new Promise((res, rej) => {
            const rows: Row[] = [];
            const invalidRows: Row[] = [];
            stream
                .on('data', (row: Row) => rows.push(row))
                .on('data-invalid', (row: Row) => invalidRows.push(row))
                .on('error', rej)
                .on('end', (count: number) => {
                    res({ count, rows, invalidRows });
                });
        });

    const parseContentAndCollectFromStream = (data: PathAndContent, parser: CsvParserStream): Promise<ParseResults> =>
        new Promise((res, rej) => {
            const rows: Row[] = [];
            const invalidRows: Row[] = [];
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

    const parseContentAndCollect = (data: PathAndContent, options: ParserOptionsArgs = {}): Promise<ParseResults> =>
        new Promise((res, rej) => {
            const rows: Row[] = [];
            const invalidRows: Row[] = [];
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
        const actual: Row[] = [];
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

    it('should allow specifying of columns', () => {
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

    it('should allow renaming columns', () => {
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

    it('should parse data with an alternate encoding', () =>
        parseContentAndCollect(assets.alternateEncoding, { headers: true, encoding: 'utf16le' }).then(
            ({ count, rows }) => {
                assert.deepStrictEqual(rows, assets.alternateEncoding.parsed);
                assert.strictEqual(count, rows.length);
            },
        ));

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

    it('should emit an error for malformed rows', next => {
        assets.write(assets.malformed);
        const stream = csv.parseFile(assets.malformed.path, { headers: true });
        listenForError(stream, "Parse Error: expected: ',' OR new line got: 'a'. at 'a   \", Las", next);
    });

    describe('#validate', () => {
        const syncValidator = (row: Row): boolean =>
            parseInt((row as RowMap).first_name.replace(/^First/, ''), 10) % 2 === 1;
        const asyncValidator = (row: Row, cb: RowValidateCallback) => {
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
            const validator = (row: Row): boolean =>
                parseInt((row as RowMap).first_name.replace(/^First/, ''), 10) % 2 !== 0;
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
                .validate((data: Row, validateNext): void => {
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
        const transformer = (row: Row): Row => ({
            firstName: (row as RowMap).first_name,
            lastName: (row as RowMap).last_name,
            emailAddress: (row as RowMap).email_address,
            address: (row as RowMap).address,
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
                const rows: Row[] = [];
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
            const actual: Row[] = [];
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
