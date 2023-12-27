const path = require('path');
const fs = require('fs');
const fastCsv = require('fast-csv');

function camelize(str) {
    return str.replace(/_(.)/g, (a, b) => b.toUpperCase());
}

const promisfyStream = (stream, expectedRows) => {
    let count = 0;
    return new Promise((res, rej) => {
        stream
            .on('data', () => {
                count += 1;
            })
            .on('end', () => {
                if (count !== expectedRows) {
                    rej(new Error(`Error expected ${expectedRows} got ${count}`));
                } else {
                    res(() => {});
                }
            })
            .on('error', rej);
    });
};

const benchmarkFastCsv = (type) => (num) => {
    const file = path.resolve(__dirname, `./assets/${num}.${type}.csv`);
    const stream = fs
        .createReadStream(file)
        .pipe(fastCsv.parse({ headers: true }))
        .transform((data) => {
            const ret = {};
            ['first_name', 'last_name', 'email_address'].forEach((prop) => {
                ret[camelize(prop)] = data[prop];
            });
            ret.address = data.address;
            return ret;
        });
    return promisfyStream(stream, num);
};

async function benchmarkRun(title, num, m) {
    const start = new Date();
    let runStart = start;
    const howMany = 5;
    for (let i = 0; i < howMany; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await m(num);
        console.log('%s: RUN(%d lines) 1 %dms', title, num, new Date() - runStart);
        runStart = new Date();
    }
    console.log('%s: %dxAVG for %d lines %dms', title, howMany, num, (new Date() - start) / howMany);
    return { howMany, avg: (new Date() - start) / howMany };
}

function runBenchmarks(num, type, results) {
    console.log(`\nRUNNING ${num}.${type}.csv benchmarks`, num);
    return benchmarkRun('fast-csv', num, benchmarkFastCsv(type)).then(({ howMany, avg }) => {
        results.push({ type, rows: num, runs: howMany, avg });
    });
}

function benchmarks(type) {
    const results = [];
    return runBenchmarks(1000, type, results)
        .then(() => runBenchmarks(10000, type, results))
        .then(() => runBenchmarks(20000, type, results))
        .then(() => runBenchmarks(50000, type, results))
        .then(() => runBenchmarks(100000, type, results))
        .then(() => results);
}

console.log('Starting Benchmarks');
benchmarks('nonquoted')
    .then((nonQuotedResults) => {
        return benchmarks('quoted').then((quotedResults) => {
            return [...nonQuotedResults, ...quotedResults];
        });
    })
    .then((results) => {
        const resultsTable = [
            ['Type', 'Row Count', 'No. Runs', 'Avg'],
            ['-', '-', '-', '-'],
            ...results.map(({ type, rows, runs, avg }) => [type, rows, runs, `${avg}ms`]),
        ]
            .map((r) => `|${r.join('|')}|`)
            .join('\n');
        fs.writeFileSync(path.resolve(__dirname, 'README.md'), `## Benchmark Results\n\n${resultsTable}`);
    })
    .then(() => process.exit())
    .catch((e) => {
        console.error(e.stack);
        return process.exit(1);
    });
