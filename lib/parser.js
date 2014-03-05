var extended = require("./extended"),
    trim = extended.trim,
    trimLeft = extended.trimLeft,
    trimRight = extended.trimRight,
    SINGLE_QUOTE = "'",
    DOUBLE_QUOTE = '"';

function createParser(options) {
    options = options || {};
    var delimiter = options.delimiter || ",",
        doLtrim = options.ltrim || false,
        doRtrim = options.rtrim || false,
        doTrim = options.trim || false,
        VALUE_REGEXP = new RegExp("([^" + delimiter + "'\"\\s\\\\]*(?:\\s+[^" + delimiter + "'\"\\s\\\\]+)*)"),
        SEARCH_REGEXP = new RegExp("[^\\\\]" + delimiter),
        ESCAPE_CHAR = "\\",
        WHITE_SPACE = /\s/;

    function formatItem(item) {
        if (doTrim) {
            item = trim(item);
        } else if (doLtrim) {
            item = trimLeft(item);
        } else if (doRtrim) {
            item = trimRight(item);
        }
        return item;
    }

    function getTokensBetween(str, start, items, cursor) {
        var depth = 0, ret = [];
        str = Object(str);
        var startPushing = false, token, i = 0;
        if (str.length) {
            while ((token = str.charAt(cursor)) !== null) {
                if (token === start) {
                    if (!startPushing) {
                        depth++;
                        startPushing = true;
                    } else if (str.charAt(cursor + 1) === start) {
                        cursor++;
                        i = ret.push(token) - 1;
                    } else if (ret[i] === ESCAPE_CHAR) {
                        ret.pop();
                        i = ret.push(token) - 1;
                    } else {
                        depth--;
                    }
                    if (depth === 0) {
                        break;
                    }
                } else {
                    i = ret.push(token) - 1;
                }
                ++cursor;
            }
        }
        if (++cursor < str.length && getNextToken(str, cursor).token.search(delimiter) !== 0) {
            throw new Error("Invalid row " + str);
        }
        items.push(formatItem(ret.join("")));
        return ++cursor;
    }

    function findNextToken(line, items, cursor) {
        var searchStr = line.substr(cursor),
            nextIndex = searchStr.search(SEARCH_REGEXP);
        if (nextIndex === -1) {
            if (!searchStr.match(VALUE_REGEXP)) {
                throw new Error("Invalid row " + searchStr);
            } else {
                nextIndex = searchStr.length - 1;
            }
        }
        items.push(formatItem(searchStr.substr(0, nextIndex + 1)));
        return cursor + (nextIndex + 2);
    }


    function parseSingleQuoteItem(line, items, cursor) {
        return getTokensBetween(line, SINGLE_QUOTE, items, cursor);
    }

    function parseDoubleQuoteItem(line, items, cursor) {
        return getTokensBetween(line, DOUBLE_QUOTE, items, cursor);
    }

    function parseItem(line, items, cursor) {
        return findNextToken(line, items, cursor);
    }

    function getNextToken(line, cursor) {
        var l = line.length, ret, token;
        do {
            token = line[cursor];
            if (token === delimiter || !WHITE_SPACE.test(token)) {
                ret = token;
            } else {
                token = null;
            }

        } while (!token && cursor++ < l);
        if (!token) {
            throw new Error("Invalid row " + line);
        }
        return {token: token, cursor: cursor};
    }

    return function parseLine(line) {
        var i = 0, l = line.length, items = [], token, nextToken;
        while (i < l) {
            nextToken = getNextToken(line, i);
            token = nextToken.token;
            if (token === delimiter) {
                items.push("");
                i++;
            } else if (token === SINGLE_QUOTE) {
                i = parseSingleQuoteItem(line, items, nextToken.cursor);
            } else if (token === DOUBLE_QUOTE) {
                i = parseDoubleQuoteItem(line, items, nextToken.cursor);
            } else {
                i = parseItem(line, items, i);
            }

        }
        return items;
    };

}

module.exports = createParser;
