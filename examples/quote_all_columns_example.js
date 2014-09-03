var csv = require("../"),
    fs = require("fs"),
    path = require("path"),
    csvStream = csv.format({headers: true, quoteColumns: true});

csvStream
    .pipe(fs.createWriteStream(path.resolve("./assets", "quote_all_columns.csv")))
    .on("end", process.exit);

csvStream.write({header1: "value1a", header2: "value2a"});
csvStream.write({header1: "value1a", header2: "value2a"});
csvStream.write({header1: "value1a", header2: "value2a"});
csvStream.write({header1: "value1a", header2: "value2a"});
csvStream.end();

