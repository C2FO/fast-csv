import * as path from 'path';
import * as fs from 'fs';
import { FormatterOptionsArgs, Row, writeToStream } from '@fast-csv/format';

const write = (stream: NodeJS.WritableStream, rows: Row[], options: FormatterOptionsArgs<Row, Row>): Promise<void> => {
    return new Promise((res, rej) => {
        writeToStream(stream, rows, options)
            .on('error', err => rej(err))
            .on('finish', () => res());
    });
};

// create a new csv
const createCsv = (filePath: string, rows: Row[]): Promise<void> => {
    const csvFile = fs.createWriteStream(filePath);
    return write(csvFile, rows, { headers: true, includeEndRowDelimiter: true });
};

// append the rows to the csv
const appendToCsv = (filePath: string, rows: Row[] = []): Promise<void> => {
    const csvFile = fs.createWriteStream(filePath, { flags: 'a' });
    // notice how headers are set to false
    return write(csvFile, rows, { headers: false });
};

// read the file
const readFile = (filePath: string): Promise<Buffer> => {
    return new Promise((res, rej) => {
        fs.readFile(filePath, (err, contents) => {
            if (err) {
                return rej(err);
            }
            return res(contents);
        });
    });
};

const csvFilePath = path.resolve(__dirname, 'append.csv');

// 1. create the csv
createCsv(csvFilePath, [
    { a: 'a1', b: 'b1', c: 'c1' },
    { a: 'a2', b: 'b2', c: 'c2' },
    { a: 'a3', b: 'b3', c: 'c3' },
])
    // 2. append to the csv
    .then(() =>
        appendToCsv(csvFilePath, [
            { a: 'a4', b: 'b4', c: 'c4' },
            { a: 'a5', b: 'b5', c: 'c5' },
            { a: 'a6', b: 'b6', c: 'c6' },
        ]),
    )
    .then(() => readFile(csvFilePath))
    .then(contents => console.log(`${contents}`))
    .catch(err => {
        console.error(err.stack);
        process.exit(1);
    });

// Output:
// a,b,c
// a1,b1,c1
// a2,b2,c2
// a3,b3,c3
// a4,b4,c4
// a5,b5,c5
// a6,b6,c6
