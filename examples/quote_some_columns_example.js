var csv = require("../"),
    fs = require("fs"),
    path = require("path"),
    csvStream = csv.format({headers: true, quoteColumns: {header1: true}});

csvStream
    .pipe(fs.createWriteStream(path.resolve("./assets", "quote_some_columns.csv")))
    .on("end", process.exit);

csvStream.write({header1: "value1a", header2: "value2a"});
csvStream.write({header1: "value1a", header2: "value2a"});
csvStream.write({header1: "value1a", header2: "value2a"});
csvStream.write({header1: "value1a", header2: "value2a"});
csvStream.end();

