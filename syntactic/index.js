const path = require('path');
const fs = require('fs');
const { grammerFormat, getSymbol, isTerminator } = require('./utils.js');
const { getFirst, getFirstOfStr } = require('./sets/first.js');
const getFollow = require('./sets/follow.js');
const collection = require('./LR/collection.js');
const createAnalysisTable = require('./createAnalysisTable.js');

const { production2Action } = require('../codeGenerator/semanticAction.js');  // 产生式规约，之后的动作

const filename = path.resolve(__dirname, '../result/SLR分析过程.txt');
fs.writeFileSync(filename, '');  // 防止每运行一次就追加

// 文法文件转换成JS对象方便处理，START属性可以获取文法起始符
const [START, grammerObj] = grammerFormat();
// console.log(START, grammerObj);


// 获得FIRST集
const firstObj = getFirst(grammerObj, START);
// console.log(getFirstOfStr('E1 T1 T1', firstObj));  // 测试产生式串的FOLLOW集是否好使
// console.log('first集: ', firstObj, '\n');


// 获得FOLLOW集
const followObj = getFollow(grammerObj, START, firstObj);
// console.log('follow集: ', followObj, '\n');


// 获得项集族
const C = collection(grammerObj, START);
// console.log('项集族: ', C[23], '\n');
// console.log(C, '\n');


// 创建SLR分析表
const analysisTable = createAnalysisTable(C, followObj, grammerObj, START);
// console.log('SLR分析表: ', analysisTable, '\n');

module.exports = function syntactic(wordIterator) {

    // 迭代器，每次next返回一个对象，value是一个token，即{ type: xxx, value: xxx }，done属性true表示迭代结束了
    let iterator = wordIterator;

    /* // 测试迭代
    let data = iterator.next();
    while (!data.done) { //只要没有迭代完成，则取出数据
        //进行下一次迭代
        data = iterator.next();
    }
    */

    const statusStack = [0];  // 当前状态栈
    const symbolStack = [{ symbol: '$', props: {} }];  // 当前接收的符号栈  // 现在符号栈每一项是个对象，props属性存状态
    let flag = false;  // 输入栈是否为空

    let nowItem = iterator.next();
    let tokenObj = nowItem.value ? nowItem.value : { value: '$' };
    let topInput = (tokenObj.type === 'id' || tokenObj.type === 'digits') ? tokenObj.type : tokenObj.value;  // 当前待输入的符号
    if (nowItem.done) {
        flag = true;
        topInput = '$';
    };

    // 循环里
    while (true) {
        const topStatus = statusStack[statusStack.length - 1];
        const topSymbol = symbolStack[symbolStack.length - 1].symbol;

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

                const symbolObjArr = [];  // 一会传给规约完成后动作方法

                while (needPopNum--) {
                    if (right === 'ε') break;
                    statusStack.pop();
                    symbolObjArr.push(symbolStack.pop());  // 规约时符号出栈，放入到symbolObjArr
                }

                const symbolObj = { symbol: left, props: {} };  // 规约成左部对应的符号对象
                symbolStack.push(symbolObj);  // 符号栈入栈

                symbolObjArr.push(symbolObj);  // 函数参数入栈
                symbolObjArr.reverse();  // 逆序
                /* 
                    规约动作结束，symbolObj的props属性要改变
                */
                production2Action[action] && production2Action[action](symbolObjArr);  // 执行动作
            }

            else if (action === 'acc') {
                // 结束
                fs.writeFileSync(filename, `本轮操作 ${action}\n当前状态栈 ${JSON.stringify(statusStack)}\n当前符号栈 ${JSON.stringify(symbolStack)}\n当前待输入栈顶 ${topInput}\n`, {
                    flag: 'a',
                });
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

                const symbolObj = { symbol: topInput, props: {} };
                // 如果移入符号是id或digits，添加属性lexeme为真实值
                if (symbolObj.symbol === 'id' || symbolObj.symbol === 'digits') {
                    symbolObj.props.lexeme = tokenObj.value;
                }
                symbolStack.push(symbolObj);

                nowItem = iterator.next();
                tokenObj = nowItem.value ? nowItem.value : { value: '$' };  // 栈底了
                topInput = (tokenObj.type === 'id' || tokenObj.type === 'digits') ? tokenObj.type : tokenObj.value;  // 当前待输入的符号
                if (nowItem.done) {
                    flag = true;
                    topInput = '$';
                };
            }

            // console.log('本轮操作 ', action);
            // console.log('当前状态栈 ', statusStack);
            // console.log('当前符号栈 ', symbolStack);
            // console.log('当前待输入栈顶 ', topInput);
            // console.log('-----------------------------------------');

            fs.writeFileSync(filename, `本轮操作 ${action}\n当前状态栈 ${JSON.stringify(statusStack)}\n当前符号栈 ${JSON.stringify(symbolStack)}\n当前待输入栈顶 ${topInput}\n`, {
                flag: 'a',
            });
            // fs.writeFileSync(filename, '---------------------------------------------------------------\n\n', {
            //     flag: 'a',
            // });
            fs.writeFileSync(filename, '\n\n', {
                flag: 'a',
            });
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