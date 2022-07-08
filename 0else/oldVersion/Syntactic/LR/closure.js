const { isTerminator } = require('../utils.js');

/*
    算法实现都是按照ppt上的
    直到没变化之类的，事实上优化点很多
    下面为例，集合每新增一个产生式，其实只需要判断新增的式子能不能再产生新一项即可
    而不是暴力while break
*/


/**
 * 求给定项目集I闭包
 * @param {*} I 项目集
 * @param {*} grammerObj 语法对象
 */
module.exports = function closure(I, grammerObj) {
    const J = new Set([...I]);
    let oldSize = J.size;

    while (true) {
        for (const production of J) {  // production产生式
            // console.log(production);
            const right = production.split(' → ')[1].split(' ');  // 产生式右部，变成数组
            const index = right.indexOf('·');
            const V = right[index + 1];  // 期盼是V
            // console.log(V);
            if (V && !isTerminator(V)) {
                /* 是非终结符 */
                const rightArr = grammerObj[V];  // 产生式右部数组
                for (const right of rightArr) {
                    const res = right === 'ε' ? `${V} → ·` : `${V} → · ${right}`;
                    J.add(res);
                }
            }
        }

        if (J.size === oldSize) {
            break;
        }
        oldSize = J.size;
    }

    return J;
}

/*
    假设一开始只有 S1 → · S

*/