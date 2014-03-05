var fastCsv = require("../lib"),
    path = require("path");

var lines = [
    ["first_name", "last_name", "email_address", "address"]
];

var lineOptions = [
    ["First1", "Last1", "email1@email.com", "1 Street St, State ST, 88888"],
    ["First1", "Last1", "email1@email.com", '1 "Street" St, State ST, 88888'],
    ["First1", "Last1", "email1@email.com", ""],
    ["", "", "", ""],
    ["First'1", "Last1", "email1@email.com", "1 Street St, State ST, 88888"],
    ['First"1', "Last1", "email1@email.com", "1 Street St, State ST, 88888"],
    ['First"1', "Last1", "email1@email.com", "1 Street St, State ST, 88888"]
];

var i = -1, l = 20000, lineOptionsLength = lineOptions.length;
while (++i < l) {
    lines.push(lineOptions[i % lineOptionsLength]);
}

fastCsv
    .writeToPath(path.resolve(__dirname, "./assets/20000.csv"), lines)
    .on('finish', function () {

        l = 50001;
        while (++i < l) {
            lines.push(lineOptions[i % lineOptionsLength]);
        }

        fastCsv
            .writeToPath(path.resolve(__dirname, "./assets/50000.csv"), lines)
            .on('finish', function () {
                l = 100002;
                while (++i < l) {
                    lines.push(lineOptions[i % lineOptionsLength]);
                }

                fastCsv
                    .writeToPath(path.resolve(__dirname, "./assets/100000.csv"), lines)
                    .on('finish', function () {
                        l = 1000003;
                        while (++i < l) {
                            lines.push(lineOptions[i % lineOptionsLength]);
                        }

                        fastCsv.writeToPath(path.resolve(__dirname, "./assets/1000000.csv"), lines)
                            .on("finish", function () {
                                process.exit();
                            });
                    });
            });
    });

