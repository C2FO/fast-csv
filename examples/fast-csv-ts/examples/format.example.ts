import * as csv from 'fast-csv';

const csvStream = csv.format({ headers: true });

csvStream.pipe(process.stdout).on('end', () => {
    return process.exit();
});

csvStream.write({ header1: 'row1-col1', header2: 'row1-col2' });
csvStream.write({ header1: 'row2-col1', header2: 'row2-col2' });
csvStream.write({ header1: 'row3-col1', header2: 'row3-col2' });
csvStream.write({ header1: 'row4-col1', header2: 'row4-col2' });
csvStream.write({ header1: 'row5-col1', header2: 'row5-col2' });
csvStream.end();

// Output:
// header1,header2
// row1-col1,row1-col2
// row2-col1,row2-col2
// row3-col1,row3-col2
// row4-col1,row4-col2
// row5-col1,row5-col2
