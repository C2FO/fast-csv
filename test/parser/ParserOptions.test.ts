import * as assert from 'assert';
import { ParserOptions, ParserOptionsArgs } from '../../src/parser';

describe('ParserOptions', () => {
    const createOptions = (opts: ParserOptionsArgs = {}) => new ParserOptions(opts);

    describe('#objectMode', () => {
        it('should have default objectMode', () => {
            assert.strictEqual(createOptions().objectMode, true);
        });

        it('should accept a boolean objectMode', () => {
            assert.strictEqual(createOptions({ objectMode: true }).objectMode, true);
            assert.strictEqual(createOptions({ objectMode: false }).objectMode, false);
        });
    });

    describe('#delimiter', () => {
        it('should have default delimiter', () => {
            assert.strictEqual(createOptions().delimiter, ',');
        });

        it('should accept a custom delimiter', () => {
            assert.strictEqual(createOptions({ delimiter: '\t' }).delimiter, '\t');
        });

        it('should escape a custom delimiter', () => {
            assert.strictEqual(createOptions({ delimiter: '\\' }).delimiter, '\\');
            assert.strictEqual(createOptions({ delimiter: '\\' }).escapedDelimiter, '\\\\');
        });
    });

    describe('#strictColumnHandling', () => {
        it('should set default strictColumnHandling to false', () => {
            assert.strictEqual(createOptions().strictColumnHandling, false);
        });

        it('should accept a strictColumnHandling parameter', () => {
            assert.strictEqual(createOptions({ strictColumnHandling: true }).strictColumnHandling, true);
        });
    });

    describe('#quote', () => {
        it('should set a default quote value', () => {
            assert.strictEqual(createOptions().quote, '"');
        });

        it('should accept an alternate quote', () => {
            assert.strictEqual(createOptions({ quote: '$' }).quote, '$');
        });
    });

    describe('#escapeChar', () => {
        it('should set the escape character to the quote value if not specified', () => {
            assert.strictEqual(createOptions().escapeChar, '"');
        });

        it('should set the escape character to the quote value if not specified', () => {
            assert.strictEqual(createOptions({ quote: '$' }).escapeChar, '$');
        });

        it('should accept an alternate escape', () => {
            assert.strictEqual(createOptions({ escape: '%' }).escapeChar, '%');
        });
    });

    describe('#comment', () => {
        it('should set the comment null if not specified', () => {
            assert.strictEqual(createOptions().comment, null);
        });

        it('should accept a comment character', () => {
            assert.strictEqual(createOptions({ comment: '#' }).comment, '#');
        });
    });

    describe('#supportsComments', () => {
        it('should set supports comments to false by default', () => {
            assert.strictEqual(createOptions().supportsComments, false);
        });

        it('should set to true if the comment character is specified', () => {
            assert.strictEqual(createOptions({ comment: '#' }).supportsComments, true);
        });
    });

    describe('#trim', () => {
        it('should have default trim', () => {
            assert.strictEqual(createOptions().trim, false);
        });

        it('should accept a boolean objectMode', () => {
            assert.strictEqual(createOptions({ trim: true }).trim, true);
            assert.strictEqual(createOptions({ trim: false }).trim, false);
        });
    });

    describe('#ltrim', () => {
        it('should have default ltrim', () => {
            assert.strictEqual(createOptions().ltrim, false);
        });

        it('should accept a boolean objectMode', () => {
            assert.strictEqual(createOptions({ ltrim: true }).ltrim, true);
            assert.strictEqual(createOptions({ ltrim: false }).ltrim, false);
        });
    });

    describe('#rtrim', () => {
        it('should have default rtrim', () => {
            assert.strictEqual(createOptions().rtrim, false);
        });

        it('should accept a boolean objectMode', () => {
            assert.strictEqual(createOptions({ rtrim: true }).rtrim, true);
            assert.strictEqual(createOptions({ rtrim: false }).rtrim, false);
        });
    });

    describe('#discardUnmappedColumns', () => {
        it('should have default discardUnmappedColumns', () => {
            assert.strictEqual(createOptions().discardUnmappedColumns, false);
        });

        it('should accept a boolean objectMode', () => {
            assert.strictEqual(createOptions({ discardUnmappedColumns: true }).discardUnmappedColumns, true);
            assert.strictEqual(createOptions({ discardUnmappedColumns: false }).discardUnmappedColumns, false);
        });
    });

    describe('#strictColumnHandling', () => {
        it('should have default strictColumnHandling', () => {
            assert.strictEqual(createOptions().strictColumnHandling, false);
        });

        it('should accept a boolean objectMode', () => {
            assert.strictEqual(createOptions({ strictColumnHandling: true }).strictColumnHandling, true);
            assert.strictEqual(createOptions({ strictColumnHandling: false }).strictColumnHandling, false);
        });
    });

    describe('#headers', () => {
        it('should have default headers', () => {
            assert.strictEqual(createOptions().headers, null);
        });

        it('should accept an array of headers', () => {
            assert.deepStrictEqual(createOptions({ headers: ['1', '2', '3'] }).headers, ['1', '2', '3']);
        });

        it('should accept headers as a boolean', () => {
            assert.deepStrictEqual(createOptions({ headers: true }).headers, true);
        });
    });

    describe('#renameHeaders', () => {
        it('should have default renameHeaders', () => {
            assert.strictEqual(createOptions().renameHeaders, false);
        });

        it('should accept a boolean renameHeaders', () => {
            assert.strictEqual(createOptions({ renameHeaders: true }).renameHeaders, true);
            assert.strictEqual(createOptions({ renameHeaders: false }).renameHeaders, false);
        });
    });

    describe('#maxRows', () => {
        it('should default maxRows 0 and limitRows to false', () => {
            const opts = createOptions();
            assert.strictEqual(opts.maxRows, 0);
            assert.strictEqual(opts.limitRows, false);
        });

        it('should set maxRows to the provided option and limitRows to true if maxRows > 0', () => {
            const opts = createOptions({ maxRows: 1 });
            assert.strictEqual(opts.maxRows, 1);
            assert.strictEqual(opts.limitRows, true);
        });

        it('should set maxRows to the provided option and limitRows to true if maxRows === 0', () => {
            const opts = createOptions({ maxRows: 0 });
            assert.strictEqual(opts.maxRows, 0);
            assert.strictEqual(opts.limitRows, false);
        });
    });

    describe('#skipLines', () => {
        it('should default skipLines to 0', () => {
            const opts = createOptions();
            assert.strictEqual(opts.skipLines, 0);
        });

        it('should set skipLines to the user provided option', () => {
            const opts = createOptions({ skipLines: 10 });
            assert.strictEqual(opts.skipLines, 10);
        });
    });

    describe('#skipRows', () => {
        it('should default skipLines to 0', () => {
            const opts = createOptions();
            assert.strictEqual(opts.skipRows, 0);
        });

        it('should set skipLines to the user provided option', () => {
            const opts = createOptions({ skipRows: 10 });
            assert.strictEqual(opts.skipRows, 10);
        });
    });
});
