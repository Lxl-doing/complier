const path = require('path');
const fs = require('fs');
const { isTerminator, isReducedItem } = require('./utils.js');

/**
 * 返回项目集对应的SLR分析表，格式和算法在函数下面的注释
 * @param {*} C 
 * @param {*} followObj 
 * @param {*} grammerObj 
 * @param {*} START 
 */
module.exports = function createAnalysisTable(C, followObj, grammerObj, START) {
    // console.log('C: ', C);
    // console.log('FOLLOW: ', followObj);
    // console.log('grammer: ', grammerObj);

    const acceptItem = `${grammerObj[START]} → ${grammerObj[grammerObj[START]][0]} ·`;  // 接收项目
    // console.log(acceptItem);

    const analysisTable = {};
    C.forEach((objI, index) => {
        const nowObj = {};

        const next = objI.next;
        for (const nextSymbol in next) {
            if (!isTerminator(nextSymbol)) {
                // 非终结符
                nowObj[nextSymbol] = next[nextSymbol];  // 数字
            }
            else {
                // 终结符
                nowObj[nextSymbol] = `s${next[nextSymbol]}`;  // sj
            }
        }

        const I = objI.I;
        for (const item of I) {
            // item是项目，就是产生式加 ·
            if (isReducedItem(item)) {
                // 是归约项目
                const [left, right] = item.split(' → ');  // 产生式左、右部
                const leftFOLLOW = followObj[left];

                if (item === acceptItem) {
                    // 是接收项目
                    for (let nextSymbol of leftFOLLOW) {
                        if (nowObj[nextSymbol]) {
                            // 如果之前已经填过值了，说明SLR驾驭不了这个文法产生项目集的冲突，报错
                            // console.log('状态是', index, '\n');

                            // console.log(`状态 ${index} 对应的项集: `);
                            // console.log(C[index], '\n');

                            // console.log(`状态 ${index} 对应的分析表现在情况: `);
                            // console.log(nowObj, '\n');

                            // console.log(`${left} 的FOLLOW集: `);
                            // console.log(leftFOLLOW, '\n');

                            // console.log(`传入的符号是 ${nextSymbol}`);
                            // console.log('------------------------------------------------------------\n');

                            throw new Error('分析表含有冲突，且SLR文法无法解决此冲突');
                        } else {
                            nowObj[nextSymbol] = 'acc';  // 表示识别成功
                        }
                    }
                }
                else {
                    // 其他归约项目
                    // console.log(111, item);
                    // console.log(222, left, right);

                    let production;
                    if (right.length === 1) {
                        // 产生式右部就是个 ·
                        production = item.slice(0, -1) + 'ε';  // 截取后一位
                    }
                    else {
                        production = item.slice(0, -2);  // 截取后两位（包括空格）
                    }

                    for (let nextSymbol of leftFOLLOW) {
                        if (nowObj[nextSymbol]) {
                            // 如果之前已经填过值了，说明SLR驾驭不了这个文法产生项目集的冲突，报错
                            // console.log('状态是', index, '\n');

                            // console.log(`状态 ${index} 对应的项集: `);
                            // console.log(C[index], '\n');

                            // console.log(`状态 ${index} 对应的分析表现在情况: `);
                            // console.log(nowObj, '\n');

                            // console.log(`${left} 的FOLLOW集: `);
                            // console.log(leftFOLLOW, '\n');

                            // console.log(`传入的符号是 ${nextSymbol}`);
                            // console.log('------------------------------------------------------------\n');

                            throw new Error('分析表含有冲突，且SLR文法无法解决此冲突');
                        } else {
                            nowObj[nextSymbol] = production;  // 表示识别成功
                            // console.log(production);
                        }
                    }
                }
            }
        }

        analysisTable[index] = nowObj;
    })

    // console.log(analysisTable);


    // 添加到文件
    const filename = path.resolve(__dirname, '../result/SLR分析表.txt');
    fs.writeFileSync(filename, JSON.stringify(analysisTable, null, 4));  // 第三个参数格式化美观

    return analysisTable;
}

/*
    C格式：[ objI0, objI1, ... , objIn ]
    其中 objIk 的格式：{ I: { 'S1 → · T', 'T → · a B d', 'T → ·' }, next: { } }

    返回analysisTable对象，这个对象即SLR分析表：
        {
            0: {
                a: 's1',
                $: 'acc',
                ……
            },
            1: {
                A: 2,
                b: 'T → a B d'  // rj直接填产生式
            }
        }
    外层对象访问数字属性名，表示状态
    内层对象访问属性名表示接收字符之后的操作

    生成这个对象的算法：
        遍历C，获得当前状态n（下面填入到analysisTable对象的n属性值）
            设analysisTable[n] = nowObj

            枚举 objIn 的next属性，假如每次是 x
                若属性名是非终结符，nowObj[x]填一个数字，表示到下一个状态
                若属性名是终结符，nowObj[x]填 'sj' 表示符号、状态j入栈
            
            遍历 objIn 的 I 项目集合
                若有规约项目，获得产生式左部，遍历左部对应的FOLLOW集，假如每次是x，则nowObj[x]填字符串，表示使用这个产生式规约
                若这个规约项目是接收项目，遍历左部对应的FOLLOW集，假如每次是x，则nowObj[x]填 'acc'，不过理论上或许可能大概一定是nowObj['$'] = 'acc'
            上面两条填nowObj[x]，若有冲突报错
*/


