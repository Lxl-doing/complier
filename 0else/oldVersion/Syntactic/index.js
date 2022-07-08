const { grammerFormat, getSymbol, isTerminator } = require('./utils.js');
const { getFirst, getFirstOfStr } = require('./sets/first.js');
const getFollow = require('./sets/follow.js');
const collection = require('./LR/collection.js');
const createAnalysisTable = require('./createAnalysisTable.js');
const { copyFileSync } = require('fs');

// 文法文件转换成JS对象方便处理，START属性可以获取文法起始符
const [START, grammerObj] = grammerFormat();
// console.log(START, grammerObj);


// 获得FIRST集
const firstObj = getFirst(grammerObj, START);
// console.log(getFirstOfStr('E1 T1 T1', firstObj));  // 测试产生式串的FOLLOW集是否好使


// 获得FOLLOW集
const followObj = getFollow(grammerObj, START, firstObj);
// console.log(firstObj);
// console.log(followObj);


// 获得项集族
const C = collection(grammerObj, START);
// console.log(C);


// 创建SLR分析表
const analysisTable = createAnalysisTable(C, followObj, grammerObj, START);
console.log(analysisTable);

module.exports = function syntactic(tokenArr) {
    console.log('token数组: ', tokenArr);

    // 迭代器，每次next返回一个对象，value说明输入符号是什么，done属性true表示迭代结束了
    const iterator = {
        i: 0,
        next() {
            const tokenObj = tokenArr[this.i];

            const result = {};

            if (this.i < tokenArr.length) {
                result.done = false;
            } else {
                result.done = true;
                result.value = '$';
                return result;
            }

            // if (tokenObj.type === 'id' || tokenObj.type === 'digits') {
            //     result.value = tokenObj.type;
            // } else {
            //     result.value = tokenObj.value;
            // }

            // 类C语言采用上面的，下面这个用于测试用例其他简单文法
            result.value = tokenObj.value;

            this.i++;

            return result;
        }
    }

    /* 测试迭代
    let data = iterator.next();
    while (!data.done) { //只要没有迭代完成，则取出数据
        //进行下一次迭代
        data = iterator.next();
    }
    */

    const statusStack = [0];  // 当前状态栈
    const symbolStack = ['$'];  // 当前接收的符号栈
    let flag = false;  // 输入栈是否为空

    let nowItem = iterator.next();
    let topInput = nowItem.value;  // 当前待输入的符号
    if (nowItem.done) flag = true;

    // 循环里
    while (true) {
        const topStatus = statusStack[statusStack.length - 1];
        const topSymbol = symbolStack[symbolStack.length - 1];

        let action;  // 操作
        if (statusStack.length < symbolStack.length) {
            action = analysisTable[topStatus][topSymbol];
        } else {
            action = analysisTable[topStatus][topInput];
        }

        if (action) {
            if (typeof action === 'number') {
                // 操作是数字
                statusStack.push(action);
            }

            else if (action.includes('→')) {
                // 操作是产生式（规约）
                const [left, right] = action.split(' → ');
                const rightArr = right.split(' ');
                let needPopNum = rightArr.length;
                while (needPopNum--) {
                    statusStack.pop();
                    symbolStack.pop();
                }
                symbolStack.push(left);
            }

            else if (action === 'acc') {
                // 结束
                return true;
            }

            else {
                // 操作是sj
                if (flag) {
                    // 输入栈为空，就不能有sj操作了
                    return false;
                }
                const nextStatus = parseInt(action.slice(1));
                statusStack.push(nextStatus);
                symbolStack.push(topInput);
                nowItem = iterator.next();
                topInput = nowItem.value;
                if (nowItem.done) flag = true;
            }
            console.log(statusStack);
            console.log(symbolStack);
            console.log(topInput);
            console.log(action);
            console.log('-----------------------------------------');

        }
        else {
            // 查分析表失败，语法识别失败
            return false;
        }
    }
}

/*
    测试closure和goto函数
    文法是：S1 → S    S → B B    B → a B    B → b

const closure = require('./LR/closure.js');
const goto = require('./LR/goto.js');
const J = closure(new Set(['S1 → · S']), grammerObj);
console.log(J);
const J2a = goto(J, 'a', grammerObj);
console.log('接收a', J2a);
console.log('接收a后再接收a', goto(J2a, 'a', grammerObj));
const J2b = goto(J, 'b', grammerObj);
console.log('接收b', J2b);
*/