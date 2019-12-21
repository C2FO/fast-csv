import { ParserOptionsArgs } from '../../src';
import { ParserOptions } from '../../src/parser';

describe('ParserOptions', () => {
    const createOptions = (opts: ParserOptionsArgs = {}) => new ParserOptions(opts);

    describe('#objectMode', () => {
        it('should have default objectMode', () => {
            expect(createOptions().objectMode).toBe(true);
        });

        it('should accept a boolean objectMode', () => {
            expect(createOptions({ objectMode: true }).objectMode).toBe(true);
            expect(createOptions({ objectMode: false }).objectMode).toBe(false);
        });
    });

    describe('#delimiter', () => {
        it('should have default delimiter', () => {
            expect(createOptions().delimiter).toBe(',');
        });

        it('should accept a custom delimiter', () => {
            expect(createOptions({ delimiter: '\t' }).delimiter).toBe('\t');
        });

        it('should escape a custom delimiter', () => {
            expect(createOptions({ delimiter: '\\' }).delimiter).toBe('\\');
            expect(createOptions({ delimiter: '\\' }).escapedDelimiter).toBe('\\\\');
        });
    });

    describe('#strictColumnHandling', () => {
        it('should set default strictColumnHandling to false', () => {
            expect(createOptions().strictColumnHandling).toBe(false);
        });

        it('should accept a strictColumnHandling parameter', () => {
            expect(createOptions({ strictColumnHandling: true }).strictColumnHandling).toBe(true);
        });
    });

    describe('#quote', () => {
        it('should set a default quote value', () => {
            expect(createOptions().quote).toBe('"');
        });

        it('should accept an alternate quote', () => {
            expect(createOptions({ quote: '$' }).quote).toBe('$');
        });
    });

    describe('#escapeChar', () => {
        it('should set the escape character to the quote value if not specified', () => {
            expect(createOptions().escapeChar).toBe('"');
        });

        it('should set the escape character to the quote value if not specified', () => {
            expect(createOptions({ quote: '$' }).escapeChar).toBe('$');
        });

        it('should accept an alternate escape', () => {
            expect(createOptions({ escape: '%' }).escapeChar).toBe('%');
        });
    });

    describe('#comment', () => {
        it('should set the comment null if not specified', () => {
            expect(createOptions().comment).toBe(null);
        });

        it('should accept a comment character', () => {
            expect(createOptions({ comment: '#' }).comment).toBe('#');
        });
    });

    describe('#supportsComments', () => {
        it('should set supports comments to false by default', () => {
            expect(createOptions().supportsComments).toBe(false);
        });

        it('should set to true if the comment character is specified', () => {
            expect(createOptions({ comment: '#' }).supportsComments).toBe(true);
        });
    });

    describe('#trim', () => {
        it('should have default trim', () => {
            expect(createOptions().trim).toBe(false);
        });

        it('should accept a boolean objectMode', () => {
            expect(createOptions({ trim: true }).trim).toBe(true);
            expect(createOptions({ trim: false }).trim).toBe(false);
        });
    });

    describe('#ltrim', () => {
        it('should have default ltrim', () => {
            expect(createOptions().ltrim).toBe(false);
        });

        it('should accept a boolean objectMode', () => {
            expect(createOptions({ ltrim: true }).ltrim).toBe(true);
            expect(createOptions({ ltrim: false }).ltrim).toBe(false);
        });
    });

    describe('#rtrim', () => {
        it('should have default rtrim', () => {
            expect(createOptions().rtrim).toBe(false);
        });

        it('should accept a boolean objectMode', () => {
            expect(createOptions({ rtrim: true }).rtrim).toBe(true);
            expect(createOptions({ rtrim: false }).rtrim).toBe(false);
        });
    });

    describe('#discardUnmappedColumns', () => {
        it('should have default discardUnmappedColumns', () => {
            expect(createOptions().discardUnmappedColumns).toBe(false);
        });

        it('should accept a boolean objectMode', () => {
            expect(createOptions({ discardUnmappedColumns: true }).discardUnmappedColumns).toBe(true);
            expect(createOptions({ discardUnmappedColumns: false }).discardUnmappedColumns).toBe(false);
        });
    });

    describe('#strictColumnHandling', () => {
        it('should have default strictColumnHandling', () => {
            expect(createOptions().strictColumnHandling).toBe(false);
        });

        it('should accept a boolean objectMode', () => {
            expect(createOptions({ strictColumnHandling: true }).strictColumnHandling).toBe(true);
            expect(createOptions({ strictColumnHandling: false }).strictColumnHandling).toBe(false);
        });
    });

    describe('#headers', () => {
        it('should have default headers', () => {
            expect(createOptions().headers).toBeNull();
        });

        it('should accept an array of headers', () => {
            expect(createOptions({ headers: ['1', '2', '3'] }).headers).toEqual(['1', '2', '3']);
        });

        it('should accept a function', () => {
            const opts = createOptions({ headers: headers => headers.map(h => h?.toLowerCase()) });
            // @ts-ignore
            expect(opts.headers(['A', 'B', 'C'])).toEqual(['a', 'b', 'c']);
        });

        it('should accept headers as a boolean', () => {
            expect(createOptions({ headers: true }).headers).toBe(true);
        });
    });

    describe('#renameHeaders', () => {
        it('should have default renameHeaders', () => {
            expect(createOptions().renameHeaders).toBe(false);
        });

        it('should accept a boolean renameHeaders', () => {
            expect(createOptions({ renameHeaders: true }).renameHeaders).toBe(true);
            expect(createOptions({ renameHeaders: false }).renameHeaders).toBe(false);
        });
    });

    describe('#maxRows', () => {
        it('should default maxRows 0 and limitRows to false', () => {
            const opts = createOptions();
            expect(opts.maxRows).toBe(0);
            expect(opts.limitRows).toBe(false);
        });

        it('should set maxRows to the provided option and limitRows to true if maxRows > 0', () => {
            const opts = createOptions({ maxRows: 1 });
            expect(opts.maxRows).toBe(1);
            expect(opts.limitRows).toBe(true);
        });

        it('should set maxRows to the provided option and limitRows to true if maxRows === 0', () => {
            const opts = createOptions({ maxRows: 0 });
            expect(opts.maxRows).toBe(0);
            expect(opts.limitRows).toBe(false);
        });
    });

    describe('#skipLines', () => {
        it('should default skipLines to 0', () => {
            const opts = createOptions();
            expect(opts.skipLines).toBe(0);
        });

        it('should set skipLines to the user provided option', () => {
            const opts = createOptions({ skipLines: 10 });
            expect(opts.skipLines).toBe(10);
        });
    });

    describe('#skipRows', () => {
        it('should default skipLines to 0', () => {
            const opts = createOptions();
            expect(opts.skipRows).toBe(0);
        });

        it('should set skipLines to the user provided option', () => {
            const opts = createOptions({ skipRows: 10 });
            expect(opts.skipRows).toBe(10);
        });
    });
});
