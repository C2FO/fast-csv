module.exports = require("extended")()
    .register(require("is-extended"))
    .register(require("object-extended"))
    .register(require("string-extended"))
    .register("LINE_BREAK", (process.platform === 'win32' ? '\r\n' : '\n'));