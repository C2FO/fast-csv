var SINGLE_QUOTE = "'",
    DOUBLE_QUOTE = '"';

function createParser(delimiter) {

    var VALUE_REGEXP = new RegExp("([^" + delimiter + "'\"\\s\\\\]*(?:\\s+[^" + delimiter + "'\"\\s\\\\]+)*)"),
        SEARCH_REGEXP = new RegExp("[^\\\\]" + delimiter),
        ESCAPE_CHAR = "\\";

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
        if (++cursor < str.length && str[cursor].search(delimiter) !== 0) {
            throw new Error("Invalid row " + str);
        }
        items.push(ret.join(""));
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
        items.push(searchStr.substr(0, nextIndex + 1));
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

    return function parseLine(line) {
        var i = 0, l = line.length, items = [], token;
        while (i < l) {
            token = line[i];
            if (token === delimiter) {
                items.push("");
                i++;
            } else if (token === SINGLE_QUOTE) {
                i = parseSingleQuoteItem(line, items, i);
            } else if (token === DOUBLE_QUOTE) {
                i = parseDoubleQuoteItem(line, items, i);
            } else {
                i = parseItem(line, items, i);
            }
        }
        return items;
    };

}

module.exports = createParser;
