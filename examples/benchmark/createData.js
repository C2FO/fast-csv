const path = require('path');
const fastCsv = require('fast-csv');

const headers = [['first_name', 'last_name', 'email_address', 'address']];

const nonQuotedLines = [
    ['First1', 'Last1', 'email1@email.com', '1 Street St State ST 88888'],
    ['First1', 'Last1', 'email1@email.com', ''],
    ['First1', 'Last1', '', ''],
    ['First1', '', '', ''],
    ['', '', '', ''],
];

const quotedLines = [
    ["First'1", '"Last1"', '"email1@email.com"', '1 Street St, State ST, 88888'],
    ["First'1", '"Last1"', '"email1@email.com"', '""'],
    ["First'1", '"Last1"', '""', '""'],
    ["First'1", '""', '""', '""'],
    ['""', '""', '""', '""'],
];

const writeCsv = (count, lineOptions, filename) => {
    console.log(`Writing ${filename}...`);
    const rows = [...headers];
    const lineOptionLength = lineOptions.length;
    for (let i = 0; i < count; i += 1) {
        rows.push(lineOptions[i % lineOptionLength]);
    }
    return new Promise((res, rej) => {
        fastCsv
            .writeToPath(path.resolve(__dirname, `./assets/${filename}`), rows)
            .on('finish', res)
            .on('error', rej);
    });
};

writeCsv(1000, nonQuotedLines, '1000.nonquoted.csv')
    .then(() => writeCsv(10000, nonQuotedLines, '10000.nonquoted.csv'))
    .then(() => writeCsv(20000, nonQuotedLines, '20000.nonquoted.csv'))
    .then(() => writeCsv(50000, nonQuotedLines, '50000.nonquoted.csv'))
    .then(() => writeCsv(100000, nonQuotedLines, '100000.nonquoted.csv'))
    .then(() => writeCsv(1000, quotedLines, '1000.quoted.csv'))
    .then(() => writeCsv(10000, quotedLines, '10000.quoted.csv'))
    .then(() => writeCsv(20000, quotedLines, '20000.quoted.csv'))
    .then(() => writeCsv(50000, quotedLines, '50000.quoted.csv'))
    .then(() => writeCsv(100000, quotedLines, '100000.quoted.csv'))
    .catch((e) => console.error(e));
