const closure = require('./closure.js');

/**
 * 返回项目集I对应与文法符号X的后继项目集闭包
 * @param {*} I 项目集
 * @param {*} X 文法符号X，可以属于V或T
 * @param {*} grammerObj 语法对象
 */
module.exports = function goto(I, X, grammerObj) {
    const J = new Set();

    for (const production of I) {
        const proArr = production.split(' → ');  // 产生式右部，变成数组
        const leftStr = proArr[0];
        const rightArr = production.split(' → ')[1].split(' ');  // 产生式右部，变成数组
        const index = rightArr.indexOf('·');

        if (rightArr[index + 1] && rightArr[index + 1] === X) {  // 下一个符号是X
            rightArr.splice(index, 1);
            rightArr.splice(index + 1, 0, '·');  // 不是返回新数组，不能链式写

            const newProduction = `${leftStr} → ${rightArr.join(' ')}`;
            // console.log(production, '    ', newProduction);
            J.add(newProduction);
        }
    }

    return closure(J, grammerObj);
}