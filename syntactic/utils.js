const fs = require('fs');
const path = require('path');

const grammerFile = path.resolve(__dirname, '../input/grammer.txt');
const grammerContent = fs.readFileSync(grammerFile, "utf-8");

/**
 * 初始语法文件转化成js对象，添加到文件里
 * @returns [START, {
        'P': [ 'D S' ],
        'D': [ 'L id ; D', 'null' ],
        'L': [ 'int', 'float' ],
        START: 'P'  // 表示文法起始
    }]
 */
function grammerFormat() {
    let pArr = grammerContent.split('\r\n');  // (v,t,p,s)
    const pObj = {};

    let flag = true;
    const START = Symbol('S');  // 文法最开始非终结符
    pArr.map(it => {
        return it.split(' → ');
    }).forEach(it => {
        if (flag) {
            pObj[START] = it[0];
            flag = false;
        }
        if (!pObj[it[0]]) {
            pObj[it[0]] = [it[1]];
        }
        else {
            pObj[it[0]].push(it[1]);
        }
    })

    // console.log(pObj);

    // 添加到文件
    const filename = path.resolve(__dirname, '../result/grammerObj.txt');
    fs.writeFileSync(filename, JSON.stringify(pObj, null, 4));  // 第三个参数格式化美观

    return [START, pObj];
}


/**
 * 是否是终结符（判断方式是字符串只要有一个字符是大写字母就false）
 * @param {*} str 
 * @returns 
 */
function isTerminator(str) {
    for (let c of str) {
        if (c >= 'A' && c <= 'Z') {
            return false;
        }
    }
    return true;
}


/**
 * 传入一个项目，返回是否是规约项目
 * @param {*} str 
 */
function isReducedItem(str) {
    if (str[str.length - 1] === '·') {
        return true;
    }
    return false;
}


/**
 * 获得文法所有符号，返回一个数组，第一个元素V数组，第二个元素是T数组
 * @param {*} grammerObj 
 */
function getSymbol(grammerObj) {
    const res = [[], []];
    const TSet = new Set();

    for (const prop in grammerObj) {
        res[0].push(prop);
        grammerObj[prop].forEach(r => {
            r.split(' ').forEach(it => {
                if (isTerminator(it) && it !== 'ε') TSet.add(it);
            });
        })
    }

    res[1] = [...TSet];

    return res;
}


/**
 * 判断现在first集或follow集是否变化，作为结束条件
 * @param {*} oldObj 
 * @param {*} newObj 
 * @returns 
 */
function isChange(oldObj, newObj) {
    const lengthObj = {};  // 借助长度判断
    Object.keys(oldObj).forEach(it => {
        lengthObj[it] = oldObj[it].size;
    })
    const newKeys = Object.keys(newObj);
    for (let it of newKeys) {
        const setItem = newObj[it];
        if (setItem.size !== lengthObj[it]) {
            return true;  // 这一轮还是改变了
        }
    }
    return false;
}


/**
 * 这个针对性比较强，对于对象 { a: Set() } 里面的Set进行克隆
 * @param {*} obj 
 * @returns 
 */
function deepClone(obj) {
    const newObj = {}
    for (const prop in obj) {
        newObj[prop] = new Set([...obj[prop]]);
    }
    return newObj;
}


/**
 * 若对象属性值为Set，则变成Array
 * @param {*} obj 
 * @returns 新对象
 */
function setToArr(obj) {
    if (obj instanceof Array) {
        return obj.map(it => {
            return {
                I: [...it.I],
                next: { ...it.next },
            }
        });
    }
    else {
        const newObj = {};
        for (let prop in obj) {
            if (Object.prototype.toString.apply(obj[prop]) === '[object Set]') {
                newObj[prop] = [...obj[prop]];
            }
        }
        return newObj;
    }
}


module.exports = {
    grammerFormat,
    isTerminator,
    isReducedItem,
    getSymbol,
    isChange,
    deepClone,
    setToArr,
}