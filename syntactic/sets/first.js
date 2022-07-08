// first.js
const path = require('path');
const fs = require('fs');
const { isTerminator } = require('../utils.js');
const { deepClone, isChange, setToArr } = require('../utils.js');

/**
 * 输入一个文法（格式如下面注释），返回其FIRST集
 * @param {*} grammerObj    {
                                'P': [ 'D S' ],
                                'D': [ 'L id ; D', 'null' ],
                                'L': [ 'int', 'float' ],
                                START: 'P'  // 表示文法起始
                            }]
 * @param {*} START START
 * @returns 
 */
function getFirst(grammerObj, START) {

    const firstObj = {};  // 属性值是set
    const flagObj = {};  // 数组，表示哪个非终结符 可以 推出ε

    // 数据初始化
    Object.keys(grammerObj).forEach(it => {
        if (it != START) {
            firstObj[it] = new Set();
            flagObj[it] = false;
        }
    })
    // console.log(firstObj);
    // console.log(isChange(firstObj,firstObj));

    // 用来对比判断是否退出循环
    let oldFirstObj = deepClone(firstObj);

    // 暴力循环，任何first集不变结束
    while (true) {

        Object.keys(grammerObj).forEach(key => {

            if (key === START) { return; }

            else {
                const rightArr = grammerObj[key];  // 左部是key的产生式右部数组

                for (let item of rightArr) {  // item即 一个 产生式右部
                    const itemArr = item.split(' ');  // 一产生式右部，按空格分割，每个元素是V或T

                    if (isTerminator(itemArr[0]) && itemArr[0] !== 'ε') {
                        // 是终结符且不是空
                        firstObj[key] = firstObj[key].add(itemArr[0]);
                    }

                    else if (!isTerminator(itemArr[0])) {
                        // 是非终结符，注意，第一个是V，后面不会出现ε，如 A -> Bε 不可能！
                        for (let i = 0; i < itemArr.length; i++) {

                            const V = itemArr[i];  // 第一次循环一定是非终结符
                            if (isTerminator(V)) {  // 之后的循环遇到T
                                firstObj[key] = firstObj[key].add(V);  // 加入，因为能走到这前面一定能推出空
                                break;
                            }
                            // 非终结符
                            const cloneObj = new Set([...firstObj[V]]);
                            cloneObj.delete('ε');
                            firstObj[key] = new Set([...firstObj[key], ...cloneObj]);

                            if (!flagObj[V]) break;  // 本次非终结符不能推出空
                            else {
                                // 本次V可以推出空
                                if (i === itemArr.length - 1) {
                                    // 是最后一个终结符
                                    flagObj[key] = true;  // 产生式左部也能推出空
                                    firstObj[key] = firstObj[key].add('ε');  // first集里面有空
                                }
                            }
                        }
                    }

                    else if (itemArr[0] === 'ε') {
                        // 是空
                        flagObj[key] = true;
                        firstObj[key] = firstObj[key].add('ε');
                    }
                }
            }
        });

        // console.log(firstObj);
        // console.log('-----------------------------------------');


        // 一轮过后，判断是否全不变了
        if (!isChange(oldFirstObj, firstObj)) {
            break;
        } else {
            oldFirstObj = deepClone(firstObj);
        }
    }

    // console.log(firstObj);

    // 添加到文件
    const filename = path.resolve(__dirname, '../../result/FIRST集.txt');
    fs.writeFileSync(filename, JSON.stringify(setToArr(firstObj), null, 4));  // 第三个参数格式化美观

    return firstObj;
}


/**
 * 传入一个产生式串，以及现在单个非终结符的FIRST集，返回str的FIRST集
 * @param {*} str 
 * @param {*} firstObj 
 * @returns 
 */
function getFirstOfStr(str, firstObj) {
    if (!str) return null;

    const strFirst = new Set();

    str = str.split(' ');

    for (let i = 0; i < str.length; i++) {
        if (isTerminator(str[i])) {
            strFirst.add(str[i]);
            break;
        }
        let flag = false;  // 默认无 ε
        [...firstObj[str[i]]].forEach(it => {
            if (it === 'ε') flag = true;
            else {
                strFirst.add(it);
            }
        })
        if (!flag) {
            break;
        }
        if (i === str.length - 1) strFirst.add('ε');
    }

    return [...strFirst];
}

module.exports = {
    getFirst,
    getFirstOfStr,
}