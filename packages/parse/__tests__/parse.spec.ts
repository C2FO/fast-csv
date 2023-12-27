import * as fs from 'fs';
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
