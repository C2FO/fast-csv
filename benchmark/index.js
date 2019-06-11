const path = require('path');
const fs = require('fs');
const fastCsv = require('..');


function camelize(str) {
    return str.replace(/_(.)/g, (a, b) => b.toUpperCase());
}

const promisfyStream = (stream, expectedRows) => {
    let count = 0;
    return new Promise((res, rej) => {
        stream
            .on('data', (row) => {
                count += 1;
            })
            .on('end', () => {
                if (count !== expectedRows) {
                    rej(new Error(`Error expected ${expectedRows} got ${count}`));
                } else {
                    res();
                }
            })
            .on('error', rej);
    });
};

const benchmarkFastCsv = type => (num) => {
    const file = path.resolve(__dirname, `./assets/${num}.${type}.csv`);
    const stream = fs.createReadStream(file)
        .pipe(fastCsv.parse({ headers: true }))
        .transform((data) => {
            const ret = {};
            [ 'first_name', 'last_name', 'email_address' ].forEach((prop) => {
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
        console.log('%s: RUN(%d lines) 1 %dms', title, num, (new Date() - runStart));
        runStart = new Date();
    }
    console.log('%s: 3xAVG for %d lines %dms', title, num, (new Date() - start) / howMany);
}

function runBenchmarks(num, type) {
    console.log(`\nRUNNING ${num}.${type}.csv benchmarks`, num);
    return benchmarkRun('fast-csv', num, benchmarkFastCsv(type))
}

function benchmarks(type) {
    return runBenchmarks(20000, type)
        .then(() => runBenchmarks(50000, type))
        .then(() => runBenchmarks(100000, type));
}

benchmarks('nonquoted')
    .then(() => benchmarks('quoted'))
    .then(() => process.exit())
    .catch((e) => {
        console.error(e.stack);
        return process.exit(1);
    });
