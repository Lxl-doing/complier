const codeList = [];  // 指令序列
let nextQuad = 0;  // 目前指令序列末尾指令 下一条指令 对应的标号


/**
 * 返回新的临时变量，例如t0、t1
 */
const newTemp = (function () {
    let i = 0;
    return function () {
        return `t${i++}`;
    }
})();


/**
 * 传入代码字符串，在当前指令序列后追加
 * @param {*} codeStr
 */
function gen(codeStr) {
    codeList.push(`${nextQuad++}:\t${codeStr}\n`);
}


/**
 * 获得下一条指令对应的标号
 * @returns 
 */
function getNextQuad() {
    return nextQuad;
}


/**
 * 创建一个只包含i的列表，返回数组引用
 * @param {*} i 
 * @returns 
 */
function makeList(i) {
    const list = [i];
    return list;
}


/**
 * 将p1和p2指向数组合并，返回新指针
 * @param {*} p1 
 * @param {*} p2 
 * @returns 
 */
function merge(p1, p2) {
    let p;
    if (p1 && p2) {
        p = [...p1, ...p2];
    }
    else if (p1) {
        p = [...p1];
    }
    else if (p2) {
        p = [...p2];
    }
    else p = [];
    return p;
}


/**
 * 将i作为目标标号插入到数组p里的各指令中
 * @param {*} p 
 * @param {*} i 
 */
function backPatch(p, i) {
    p && p.forEach(index => {
        let str = codeList[index];
        str = str.replace('$', i);
        codeList.splice(index, 1, str);
    })
}

module.exports = {
    newTemp,
    gen,
    getNextQuad,
    codeList,
    makeList,
    merge,
    backPatch,
}