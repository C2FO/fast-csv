const path = require('path');
const fs = require('fs');
const csv = require('@fast-csv/format');

class CsvFile {
    static write(filestream, rows, options) {
        return new Promise((res, rej) => {
            csv.writeToStream(filestream, rows, options)
                .on('error', err => rej(err))
                .on('finish', () => res());
        });
    }

    constructor(opts) {
        this.headers = opts.headers;
        this.path = opts.path;
        this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true };
    }

    create(rows) {
        return CsvFile.write(fs.createWriteStream(this.path), rows, { ...this.writeOpts });
    }

    append(rows) {
        return CsvFile.write(fs.createWriteStream(this.path, { flags: 'a' }), rows, {
            ...this.writeOpts,
            // dont write the headers when appending
            writeHeaders: false,
        });
    }

    read() {
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
