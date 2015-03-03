var csv = require("../"),
    fs = require("fs"),
    path = require("path"),
    csvStream = csv.format({headers: true, quoteColumns: [true], quoteHeaders: [false, true]});

csvStream
    .pipe(fs.createWriteStream(path.resolve("./assets", "quote_columns_and_headers_with_arrays.csv")))
    .on("end", process.exit);

csvStream.write(["header1", "header2"])
csvStream.write(["value1a", "value2a"])
csvStream.write(["value1b", "value2b"])
csvStream.write(["value1c", "value2c"])
csvStream.write(["value1d", "value2d"])
csvStream.end();

