import fs from 'fs';
import { once } from 'events';
import { tmpdir } from 'os';
import { join } from 'path';
import { collectData, expectParsed, withHeaders, write } from './__fixtures__';
import { CsvParserStream, parse, parseFile, parseStream, parseString } from '../src';

describe('.parse', () => {
    it('should accept a stream', () => {
        expect(parse({ headers: true })).toBeInstanceOf(CsvParserStream);
    });
});

describe('.parseStream', () => {
    it('should accept a stream', async () => {
        write(withHeaders);
        const stream = parseStream(fs.createReadStream(withHeaders.path), { headers: true });
        await expectParsed(collectData(stream), withHeaders.parsed);
    });
});

describe('.parseFile', () => {
    const withFileStream = async (
        content: string,
        run: (file: string, source: fs.ReadStream) => Promise<void>,
    ): Promise<void> => {
        const directory = fs.mkdtempSync(join(tmpdir(), 'fast-csv-parse-file-'));
        const file = join(directory, 'input.csv');
        fs.writeFileSync(file, content);
        const source = fs.createReadStream(file);
        const createReadStream = jest.spyOn(fs, 'createReadStream').mockReturnValue(source);
        try {
            await run(file, source);
        } finally {
            createReadStream.mockRestore();
            if (!source.closed) {
                const closed = once(source, 'close');
                source.destroy();
                await closed;
            }
            fs.unlinkSync(file);
            fs.rmdirSync(directory);
        }
    };

    it('closes its file stream after a parsing error', async () => {
        const content = '"value"x,other\n' + 'value,other\n'.repeat(20000);
        await withFileStream(content, async (file, source) => {
            const parser = parseFile(file);
            const closed = new Promise<void>((resolve) => {
                parser.once('close', resolve);
            });
            await expect(collectData(parser)).rejects.toThrow('Parse Error');
            await closed;
            expect(source.destroyed).toBe(true);
            if (!source.closed) {
                await once(source, 'close');
            }
            expect(source.closed).toBe(true);
            expect(source.bytesRead).toBeLessThan(Buffer.byteLength(content));
        });
    });

    it('closes its file stream when parsing is cancelled', async () => {
        await withFileStream('value,other\n'.repeat(20000), async (file, source) => {
            const parser = parseFile(file);
            const closed = once(parser, 'close');
            parser.once('data', () => {
                parser.destroy();
            });
            await closed;
            expect(source.destroyed).toBe(true);
            if (!source.closed) {
                await once(source, 'close');
            }
            expect(source.closed).toBe(true);
        });
    });

    it('forwards file read errors to the parser once', async () => {
        const directory = fs.mkdtempSync(join(tmpdir(), 'fast-csv-parse-file-'));
        const parser = parseFile(join(directory, 'missing.csv'));
        const onError = jest.fn();
        parser.on('error', onError);
        const closed = new Promise<void>((resolve) => {
            parser.once('close', resolve);
        });
        try {
            await expect(collectData(parser)).rejects.toMatchObject({ code: 'ENOENT' });
            await closed;
            expect(onError).toHaveBeenCalledTimes(1);
        } finally {
            fs.rmdirSync(directory);
        }
    });

    it('validates options before opening the file', () => {
        const createReadStream = jest.spyOn(fs, 'createReadStream').mockImplementation(() => {
            throw new Error('Unexpected file open');
        });
        try {
            expect(() => {
                parseFile(withHeaders.path, { delimiter: '::' });
            }).toThrow('delimiter');
            expect(createReadStream).not.toHaveBeenCalled();
        } finally {
            createReadStream.mockRestore();
        }
    });

    it('does not take ownership of streams passed to parseStream', async () => {
        await withFileStream('"value"x,other\n' + 'value,other\n'.repeat(20000), async (_file, source) => {
            const parser = parseStream(source);
            const closed = new Promise<void>((resolve) => {
                parser.once('close', resolve);
            });
            await expect(collectData(parser)).rejects.toThrow('Parse Error');
            await closed;
            expect(source.destroyed).toBe(false);
        });
    });
    it('parse a csv from the given path', async () => {
        write(withHeaders);
        const stream = parseFile(withHeaders.path, { headers: true });
        await expectParsed(collectData(stream), withHeaders.parsed);
    });
});

describe('.parseString', () => {
    it('should accept a csv string', () => {
        return expectParsed(
            collectData(parseString(withHeaders.content as string, { headers: true })),
            withHeaders.parsed,
        );
    });
});
