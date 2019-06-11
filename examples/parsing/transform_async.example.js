const { EOL } = require('os');
const csv = require('../../');

const CSV_STRING = [
    'firstName,lastName',
    'bob,yukon',
    'sally,yukon',
    'timmy,yukon',
].join(EOL);

const stream = csv
    .parse({ headers: true })
    .transform((data, cb) => {
        setImmediate(() => cb(null, {
            firstName: data.firstName.toUpperCase(),
            lastName: data.lastName.toUpperCase(),
            properName: `${data.firstName} ${data.lastName}`,
        }));
    })
    .on('error', error => console.error(error))
    .on('data', row => console.log(JSON.stringify(row)))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

stream.write(CSV_STRING);
stream.end();
