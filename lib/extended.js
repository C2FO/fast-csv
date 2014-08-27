var is = require("is-extended");
module.exports = require("extended")()
    .register(is)
    .register(require("object-extended"))
    .register(require("string-extended"))
    .register("LINE_BREAK", require("os").EOL)
    .register("asyncEach", function (arr, iter, cb) {
        (function asyncIterator(i, l, rows, cb) {
            try {
                if (++i < l) {
                    iter(rows[i], function (err) {
                        if (err) {
                            cb(err);
                        } else {
                            if ((i % 100) === 0) {
                                //dont overflow the stack
                                setImmediate(function () {
                                    asyncIterator(i, l, rows, cb);
                                });
                            } else {
                                asyncIterator(i, l, rows, cb);
                            }
                        }
                    });
                } else {
                    cb(null, arr);
                }
            } catch (e) {
                cb(e);
            }
        }(-1, arr.length, arr, cb));
    })
    .register("spreadArgs", function spreadArgs(f, args, scope) {
        var ret;
        switch ((args || []).length) {
            case 0:
                ret = f.call(scope);
                break;
            case 1:
                ret = f.call(scope, args[0]);
                break;
            case 2:
                ret = f.call(scope, args[0], args[1]);
                break;
            case 3:
                ret = f.call(scope, args[0], args[1], args[2]);
                break;
            default:
                ret = f.apply(scope, args);
        }
        return ret;
    })
    .register("keys", function (obj) {
        var ret = [];
        if (is.isObject(obj)) {
            for (var i in obj) {
                ret.push(i);
            }
        }
        return ret;
    });