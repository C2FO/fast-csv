`fast-csv` javascript examples.

## Usage

To run all examples

```sh
npm run all-examples
```

To see a list of all available examples

```sh
npm run list
```

To run a specific example

```sh
npm run example -- {example_name}
```

## Examples

* [Format](#format)
* [Parse](#parse)
* [Parse And Format](#parse-and-format)

<a name="format"></a>
### Format

[`examples/format.example.js`](./examples/format.example.js)
```sh
npm run example -- format
```
```javascript
const csv = require('fast-csv');

const csvStream = csv.format({ headers: true });

csvStream.pipe(process.stdout).on('end', process.exit);

csvStream.write({ header1: 'row1-col1', header2: 'row1-col2' });
csvStream.write({ header1: 'row2-col1', header2: 'row2-col2' });
csvStream.write({ header1: 'row3-col1', header2: 'row3-col2' });
csvStream.write({ header1: 'row4-col1', header2: 'row4-col2' });
csvStream.end();
```

Expected output

```
header1,header2
row1-col1,row1-col2
row2-col1,row2-col2
row3-col1,row3-col2
row4-col1,row4-col2
```
---

<a name="parse"></a>
### Parse

[`examples/parse.example.js`](./examples/parse.example.js)
```sh
npm run example -- parse
```
```javascript
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

fs.createReadStream(path.resolve(__dirname, 'assets', 'parse.csv'))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => console.log(row))
    .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
```

Expected output

```
{ header1: 'row1-col1', header2: 'row1-col2' }
{ header1: 'row2-col1', header2: 'row2-col2' }
{ header1: 'row3-col1', header2: 'row3-col2' }
{ header1: 'row4-col1', header2: 'row4-col2' }
{ header1: 'row5-col1', header2: 'row5-col2' }
Parsed 5 rows
```
---

<a name="parse-and-format"></a>
### Parse And Format

[`examples/parse_and_format_transform_async.example.js`](./examples/parse_and_format_transform_async.example.js)
```sh
npm run example -- parse_and_format_transform_async
```
```javascript
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const User = require('./models/user');

fs.createReadStream(path.resolve(__dirname, 'assets', 'snake_case_users.csv'))
    .pipe(csv.parse({ headers: true }))
    // pipe the parsed input into a csv formatter
    .pipe(csv.format({ headers: true }))
    // Using the transform function from the formatting stream
    .transform((row, next) => {
        User.findById(row.id, (err, user) => {
            if (err) {
                return next(err);
            }
            return next(null, {
                id: row.id,
                firstName: row.first_name,
                lastName: row.last_name,
                address: row.address,
                // properties from user
                isVerified: user.isVerified,
                hasLoggedIn: user.hasLoggedIn,
                age: user.age,
            });
        });
    })
    .pipe(process.stdout)
    .on('end', process.exit);
```

Expected output

```
id,firstName,lastName,address,isVerified,hasLoggedIn,age
1,Bob,Yukon,1111 State St. Yukon AK,false,false,11
2,Sally,Yukon,1111 State St. Yukon AK,true,false,12
3,Bobby,Yukon,1111 State St. Yukon AK,false,false,13
4,Jane,Yukon,1111 State St. Yukon AK,true,true,14
5,Dick,Yukon,1111 State St. Yukon AK,false,false,15
6,John,Doe,1112 State St. Yukon AK,true,false,16
7,Jane,Doe,1113 State St. Yukon AK,false,false,17
8,Billy,Doe,1112 State St. Yukon AK,true,true,18
9,Edith,Doe,1112 State St. Yukon AK,false,false,19
```