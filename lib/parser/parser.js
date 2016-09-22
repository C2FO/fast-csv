var extended = require("./../extended"),
    has = extended.has,
    isUndefinedOrNull = extended.isUndefinedOrNull,
    trim = extended.trim,
    trimLeft = extended.trimLeft,
    trimRight = extended.trimRight;

function createParser(options) {
    options = options || {};
    var delimiter = options.delimiter || ",",
        doLtrim = options.ltrim || false,
        doRtrim = options.rtrim || false,
        doTrim = options.trim || false,
        ESCAPE = has(options, "quote") ? options.quote : '"',
        VALUE_REGEXP = new RegExp("([^" + delimiter + "'\"\\s\\\\]*(?:\\s+[^" + delimiter + "'\"\\s\\\\]+)*)"),
        SEARCH_REGEXP = new RegExp("(?:\\n|\\r|" + delimiter + ")"),
        ESCAPE_CHAR = options.escape || '"',
        NEXT_TOKEN_REGEXP = new RegExp("([^\\s]|\\r\\n|\\n|\\r|" + delimiter + ")"),
        ROW_DELIMITER = /(\r\n|\n|\r)/,
        SPACE_CHAR_REGEX = new RegExp("(?!" + delimiter + ") "),
        COMMENT, hasComments;
    if (has(options, "comment")) {
        COMMENT = options.comment;
        hasComments = true;
    }

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

    function parseEscapedItem(str, items, cursor, hasMoreData) {
        var depth = 0, ret = [];
        var startPushing = false, token, i = 0, l = str.length, escapeIsEscape = ESCAPE_CHAR === ESCAPE;
        if (l) {
            while (cursor < l && (token = str.charAt(cursor))) {
                if (token === ESCAPE) {
                    if (!startPushing) {
                        depth++;
                        startPushing = true;
                    } else if (escapeIsEscape && str.charAt(cursor + 1) === ESCAPE) {
                        cursor++;
                        ret[i++] = token;
                    } else if (!escapeIsEscape && ret[i - 1] === ESCAPE_CHAR) {
                        ret[i - 1] = token;
                    } else {
                        if (!(--depth)) {
                            ++cursor;
                            break;
                        }
                    }
                } else {
                    ret[i++] = token;
                }
                ++cursor;
            }
        }
        ret = ret.join("");
        var next = getNextToken(str, cursor),
            nextToken = next.token;
        if (nextToken && nextToken.search(delimiter) === 0) {
            if (hasMoreData && (next.cursor + 1) >= l) {
                cursor = null;
            } else {
                cursor++;
            }
        } else if (depth && !nextToken) {
            if (hasMoreData) {
                cursor = null;
            } else {
                throw new Error("Parse Error: expected: '" + ESCAPE + "' got: '" + nextToken + "'. at '" + str.substr(cursor).replace(/[r\n]/g, "\\n" + "'"));
            }
        } else if ((!depth && nextToken && nextToken.search(SEARCH_REGEXP) === -1)) {
            throw new Error("Parse Error: expected: '" + ESCAPE + "' got: '" + nextToken + "'. at '" + str.substr(cursor, 10).replace(/[\r\n]/g, "\\n" + "'"));
        } else if (hasMoreData && (!nextToken || !ROW_DELIMITER.test(nextToken))) {
            cursor = null;
        }
        if (cursor !== null) {
            items.push(formatItem(ret));
        }
        return cursor;
    }

    function parseCommentLine(line, cursor, hasMoreData) {
        var nextIndex = line.substr(cursor).search(ROW_DELIMITER);
        if (nextIndex === -1) {
            if (hasMoreData) {
                nextIndex = null;
            } else {
                nextIndex = line.length + 1;
            }
        } else {
            nextIndex = (cursor + nextIndex) + 1; //go past the next line break
        }
        return nextIndex;
    }

    function parseItem(line, items, cursor, hasMoreData) {
        var searchStr = line.substr(cursor),
            nextIndex = searchStr.search(SEARCH_REGEXP);
        if (nextIndex === -1) {
            if (!VALUE_REGEXP.test(searchStr)) {
                throw new Error("Parse Error: delimiter '" + delimiter + "' not found at '" + searchStr.replace(/\n/g, "\\n" + "'"));
            } else {
                nextIndex = searchStr.length;
            }
        }
        var nextChar = searchStr.charAt(nextIndex);
        if (nextChar.search(delimiter) !== -1) {
            if (hasMoreData && (cursor + (nextIndex + 1) >= line.length)) {
                cursor = null;
            } else {
                items.push(formatItem(searchStr.substr(0, nextIndex)));
                cursor += nextIndex + 1;

                var cursorChar = line.charAt(cursor);
                // if ends with a delimiter, append an empty element, unless strict column handling
                if (!options.strictColumnHandling && (ROW_DELIMITER.test(cursorChar) || cursor >= line.length)) {
                    items.push('');
                }
                // if ends with empty space that is not a delimiter, append an empty space, unless strict column handling
                if (!options.strictColumnHandling && SPACE_CHAR_REGEX.test(cursorChar) && !hasMoreData) {
                    items.push(cursorChar);
                }
            }
        } else if (ROW_DELIMITER.test(nextChar)) {
            items.push(formatItem(searchStr.substr(0, nextIndex)));
            cursor += nextIndex;
        } else if (!hasMoreData) {
            items.push(formatItem(searchStr.substr(0, nextIndex)));
            cursor += nextIndex + 1;
        } else {
            cursor = null;
        }

        return cursor;
    }

    function getNextToken(line, cursor) {
        var token, tokenLen, nextIndex, subStr = line.substr(cursor);
        if ((nextIndex = subStr.search(NEXT_TOKEN_REGEXP)) !== -1) {
            tokenLen = subStr.match(NEXT_TOKEN_REGEXP)[1].length;
            token = line.substr(cursor + nextIndex, tokenLen);
            cursor += nextIndex + tokenLen - 1;
        }
        return {token: token, cursor: cursor};
    }

    return function parseLine(line, hasMoreData) {
        var i = 0, l = line.length, rows = [], items = [], token, nextToken, cursor, lastLineI = 0;
        while (i < l) {
            nextToken = getNextToken(line, i);
            token = nextToken.token;
            if (isUndefinedOrNull(token)) {
                i = lastLineI;
                cursor = null;
                break;
            } else if (ROW_DELIMITER.test(token)) {
                i = nextToken.cursor + 1;
                if (i < l) {
                    rows.push(items);
                    items = [];
                    lastLineI = i;
                } else {
                    // if ends with CR and there is more data, keep unparsed due to possible coming LF in CRLF
                    if (token === '\r' && hasMoreData) {
                        i = lastLineI;
                        cursor = null;
                    }
                    break;
                }
            } else if (hasComments && token === COMMENT) {
                cursor = parseCommentLine(line, i, hasMoreData);
                if (cursor === null) {
                    i = lastLineI;
                    break;
                } else if (cursor < l) {
                    lastLineI = i = cursor;
                } else {
                    i = cursor;
                    cursor = null;
                    break;
                }
            } else {
                if (token === ESCAPE) {
                    cursor = parseEscapedItem(line, items, nextToken.cursor, hasMoreData);
                } else {
                    cursor = parseItem(line, items, i, hasMoreData);
                }
                if (cursor === null) {
                    i = lastLineI;
                    break;
                } else {
                    i = cursor;
                }
            }

        }
        cursor !== null && rows.push(items);
        return {line: line.substr(i), rows: rows};
    };

}
module.exports = createParser;
