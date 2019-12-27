import * as path from 'path';
import * as fs from 'fs';
import { FormatterOptionsArgs, Row, writeToStream } from '@fast-csv/format';

type CsvFileOpts = {
    headers: string[];
    path: string;
};

class CsvFile {
    static write(stream: NodeJS.WritableStream, rows: Row[], options: FormatterOptionsArgs<Row, Row>): Promise<void> {
        return new Promise((res, rej) => {
            writeToStream(stream, rows, options)
                .on('error', (err: Error) => rej(err))
                .on('finish', () => res());
        });
    }

    private readonly headers: string[];

    private readonly path: string;

    private readonly writeOpts: FormatterOptionsArgs<Row, Row>;

    constructor(opts: CsvFileOpts) {
        this.headers = opts.headers;
        this.path = opts.path;
        this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true };
    }

    create(rows: Row[]): Promise<void> {
        return CsvFile.write(fs.createWriteStream(this.path), rows, { ...this.writeOpts });
    }

    append(rows: Row[]): Promise<void> {
        return CsvFile.write(fs.createWriteStream(this.path, { flags: 'a' }), rows, {
            ...this.writeOpts,
            // dont write the headers when appending
            writeHeaders: false,
        } as FormatterOptionsArgs<Row, Row>);
    }

    read(): Promise<Buffer> {
        return new Promise((res, rej) => {
            fs.readFile(this.path, (err, contents) => {
                if (err) {
                    return rej(err);
                }
                return res(contents);
            });
        });
    }
}

const csvFile = new CsvFile({
    path: path.resolve(__dirname, 'append.tmp.csv'),
    // headers to write
    headers: ['c', 'b', 'a'],
});

// 1. create the csv
csvFile
    .create([
        { a: 'a1', b: 'b1', c: 'c1' },
        { b: 'b2', a: 'a2', c: 'c2' },
        { a: 'a3', b: 'b3', c: 'c3' },
    ])
    // append rows to file
    .then(() =>
        csvFile.append([
            { a: 'a4', b: 'b4', c: 'c4' },
            { a: 'a5', b: 'b5', c: 'c5' },
        ]),
    )
    // append another row
    .then(() => csvFile.append([{ a: 'a6', b: 'b6', c: 'c6' }]))
    .then(() => csvFile.read())
    .then(contents => {
        console.log(`${contents}`);
    })
    .catch(err => {
        console.error(err.stack);
        process.exit(1);
    });

// Output:
// c,b,a
// c1,b1,a1
// c2,b2,a2
// c3,b3,a3
// c4,b4,a4
// c5,b5,a5
// c6,b6,a6
