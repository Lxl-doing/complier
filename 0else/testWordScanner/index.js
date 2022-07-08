const { doesNotThrow } = require('assert');
const fs = require('fs');
const path = require('path');
const { isBlank, isDigit, isKeyWord, isLetter, isOp } = require('./utils.js');

// 为符号表做准备
const idSet = new Set();  // 不重复标识符
const keywordSet = new Set();
const opSet = new Set();
const digitsSet = new Set();

const filename = path.resolve(__dirname, '../result/testTokenArr.txt');
fs.writeFileSync(filename, '[');


/**
 * 传入代码，进行词法分析，每次调用，文件追加，返回本次迭代的可供语法分析的文法符号
 * @param {*} codeStr 
 * @returns 
 */
module.exports = function* wordScanner(codeStr) {
    let word = "";  // 初始状态

    for (let i = 0; i < codeStr.length; i++) {
        if (isDigit(codeStr[i])) {
            // 初始状态接收一个数字
            word += codeStr[i];
            while (isDigit(codeStr[++i])) {
                word += codeStr[i];
            }
            // tokenArr.push(`(const,${word})`);  // 常量

            const tokenObj = {
                type: 'digits',
                value: word,
            };  // 数字

            fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                flag: 'a',
            });
            yield tokenObj.type;

            digitsSet.add(tokenObj);
            word = "";  // 返回初始状态
            i--;  // 回退
        }
        else if (isLetter(codeStr[i])) {
            // 初始状态接收一个字母或_
            word += codeStr[i];
            while (isLetter(codeStr[++i])) {
                word += codeStr[i];
            }
            if (isKeyWord(word)) {
                // 是关键字
                // tokenArr.push(`(keyword,${word})`);  // 关键字

                const tokenObj = {
                    type: 'keyword',
                    value: word,
                };  // 关键字

                fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                    flag: 'a',
                });
                yield tokenObj.value;

                keywordSet.add(tokenObj);

            } else {
                // 是标识符
                // tokenArr.push(`(id,${word})`);  // 标识符
                const tokenObj = {
                    type: 'id',
                    value: word,
                };  // 标识符

                fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                    flag: 'a',
                });
                console.log(222222222, tokenObj.value);
                yield tokenObj.value;

                idSet.add(tokenObj);

            }
            word = "";
            i--;
        }
        else if (isOp(codeStr[i])) {
            // 初始状态接收一个操作符
            word += codeStr[i];
            if (['+', '-', '*', '/', '(', ')', "'"].includes(word)) {
                // 这些必定是单目运算符
                // tokenArr.push(`(op,${word})`);  // 运算符

                const tokenObj = {
                    type: 'op',
                    value: word,
                };  // 运算符

                fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                    flag: 'a',
                });
                yield tokenObj.value;

                opSet.add(tokenObj);
                word = "";
            }
            else {
                if (codeStr[i + 1] === '=') {
                    word += '=';
                    // tokenArr.push(`(op,${word})`);

                    const tokenObj = {
                        type: 'op',
                        value: word,
                    };  // 运算符

                    fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                        flag: 'a',
                    });
                    yield tokenObj.value;

                    opSet.add(tokenObj);
                    word = "";
                    i++;
                } else {
                    if (word === '!') {
                        // 现在已经确定下一个字符不是=，构不成双目运算符，而一个！构不成运算符
                        console.log(new Error(`未能识别的字符${word}`));
                        word = "";
                    }
                    // tokenArr.push(`(op,${word})`);

                    const tokenObj = {
                        type: 'op',
                        value: word,
                    };  // 运算符

                    fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                        flag: 'a',
                    });
                    yield tokenObj.value;

                    opSet.add(tokenObj);
                    word = "";
                }
            }
        }
        else if (codeStr[i] == ";") {
            // tokenArr.push(`(SEMI,;)`);  // 分号

            const tokenObj = {
                type: 'SIMI',
                value: ';',
            };  // 运算符

            fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                flag: 'a',
            });
            yield tokenObj.value;

            opSet.add(tokenObj);
        }
        else {
            // 识别的是空白，或不在文法内的字符
            // 空白不管，非法的输出错误
            if (!isBlank(codeStr[i])) {
                console.log(new Error(`未能识别的字符${codeStr[i]}`));
            }
        }
    }

    fs.writeFileSync(filename, ']', {
        flag: 'a',
    });

    // console.log(idSet, keywordSet, opSet, digitsSet);  // 符号表先不写文件了
}