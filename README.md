[![npm version](https://img.shields.io/npm/v/fast-csv.svg)](https://www.npmjs.org/package/fast-csv)
[![Build Status](https://travis-ci.org/C2FO/fast-csv.svg?branch=master)](https://travis-ci.org/C2FO/fast-csv)
[![Coverage Status](https://coveralls.io/repos/github/C2FO/fast-csv/badge.svg?branch=master)](https://coveralls.io/github/C2FO/fast-csv?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/C2FO/fast-csv/badge.svg?targetFile=package.json)](https://snyk.io/test/github/C2FO/fast-csv?targetFile=package.json)

# Fast-csv

Fast-csv is library for parsing and formatting csvs or any other delimited value file in node. 

## Installation

`npm install -S fast-csv`

## Documentation

* [Parsing Docs](./docs/parsing.md)
* [Formatting Docs](./docs/formatting.md)

### Quick Examples

**parsing** 

To read a csv with headers create a read stream and pipe it to parser.

```javascript
fs.createReadStream('path/to/my.csv')
  .pipe(csv.parse({ headers: true }))
  .on('data', row => console.log(row))
```

For more in depth parsing examples and docs check out the [parsing docs](./docs/parsing.md)

**formatting**

To format a csv you can write rows to a formatter.

```javascript
someStream
  .pipe(csv.format({ headers: true })
  .pipe(process.stdout);
```

For more in depth formatting examples and docs check out the [formatting docs](./docs/formatting.md)

### Migrating from older versions

* [From `v2.x` to `v3.x`](./docs/migration_guide.md#from-v2x-to-v3x) 

## License

MIT <https://github.com/C2FO/fast-csv/raw/master/LICENSE>

## Meta
* Code: `git clone git://github.com/C2FO/fast-csv.git`
* Website: <http://c2fo.com>
* Twitter: [http://twitter.com/c2fo](http://twitter.com/c2fo) - 877.465.4045

