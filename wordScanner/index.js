const fs = require('fs');
const path = require('path');
const { isBlank, isDigit, isKeyWord, isLetter, isOp } = require('./utils.js');

const filename = path.resolve(__dirname, '../result/tokenArr.txt');
fs.writeFileSync(filename, '[');

// 符号表，常用就挂载到全局对象上
global.symbolTable = {};

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

            const tokenObj = {
                type: 'digits',
                value: word,
            };  // 数字
            fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                flag: 'a',
            });  // 写文件
            yield tokenObj;  // 迭代器的一次迭代结果

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
                const tokenObj = {
                    type: 'keyword',
                    value: word,
                };  // 关键字
                global.symbolTable[word] || (global.symbolTable[word] = tokenObj);  // 符号表属性不存在再添加，否则后面修改符号表后可能会被赋予新对象覆盖
                // console.log('------', global.symbolTable);
                fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                    flag: 'a',
                });
                yield tokenObj;
            }
            else {
                // 是标识符
                const tokenObj = {
                    type: 'id',
                    value: word,
                };  // 标识符
                global.symbolTable[word] || (global.symbolTable[word] = tokenObj);  // 符号表属性不存在再添加，否则后面修改符号表后可能会被赋予新对象覆盖
                fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                    flag: 'a',
                });
                yield tokenObj;
            }
            word = "";
            i--;
        }

        else if (isOp(codeStr[i])) {
            // 初始状态接收一个操作符
            word += codeStr[i];
            if (['+', '-', '*', '/', '(', ')', "'"].includes(word)) {
                // 这些必定是单目运算符
                const tokenObj = {
                    type: 'op',
                    value: word,
                };  // 运算符
                global.symbolTable[word] || (global.symbolTable[word] = tokenObj);  // 符号表属性不存在再添加，否则后面修改符号表后可能会被赋予新对象覆盖
                fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                    flag: 'a',
                });
                yield tokenObj;

                word = "";
            }
            else {
                if (codeStr[i + 1] === '=') {
                    word += '=';
                    const tokenObj = {
                        type: 'op',
                        value: word,
                    };  // 运算符
                    global.symbolTable[word] || (global.symbolTable[word] = tokenObj);  // 符号表属性不存在再添加，否则后面修改符号表后可能会被赋予新对象覆盖
                    fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                        flag: 'a',
                    });
                    yield tokenObj;

                    word = "";
                    i++;
                } else {
                    if (word === '!') {
                        // 现在已经确定下一个字符不是=，构不成双目运算符，而一个！构不成运算符
                        console.log(new Error(`未能识别的字符${word}`));
                        word = "";
                    }

                    const tokenObj = {
                        type: 'op',
                        value: word,
                    };  // 运算符
                    global.symbolTable[word] || (global.symbolTable[word] = tokenObj);  // 符号表属性不存在再添加，否则后面修改符号表后可能会被赋予新对象覆盖
                    fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                        flag: 'a',
                    });
                    yield tokenObj;

                    word = "";
                }
            }
        }

        else if (codeStr[i] == ";") {
            const tokenObj = {
                type: 'SIMI',
                value: ';',
            };  // 运算符
            global.symbolTable[';'] || (global.symbolTable[';'] = tokenObj);
            fs.writeFileSync(filename, JSON.stringify(tokenObj, null, 4) + ',', {
                flag: 'a',
            });
            yield tokenObj;
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

    // 生成符号表文件
    const tableFilename = path.resolve(__dirname, '../result/symbolTable.txt');
    fs.writeFileSync(tableFilename, JSON.stringify(global.symbolTable, null, 4));
}