// utils.js
const keyWords = ["if", "else", "while", "int", "float"];
const op = ['+', '-', '*', '/', '>', '<', '=', '(', ')', "'", '!', '{', '}'];

// 判断字符是否是数字
function isDigit(c) {
    if (c >= '0' && c <= '9') return true;
    return false;
}

// 判断字符是否是字母或_
function isLetter(c) {
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') return true;
    return false;
}

// 判断串是否是关键字
function isKeyWord(str) {
    if (keyWords.includes(str)) return true;
    return false;
}

// 判断字符是否是空白
function isBlank(c) {
    if (c === '\n' || c === ' ' || c === '\r') return true;
    return false;
}

// 判断字符是否在可能构成操作符集合里
function isOp(c) {
    if (op.includes(c)) return true;
    return false;
}

module.exports = {
    isDigit,
    isLetter,
    isKeyWord,
    isBlank,
    isOp,
}