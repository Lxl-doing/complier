const path = require('path');
const fs = require('fs');
const closure = require('./closure.js');
const goto = require('./goto.js');
const { getSymbol, setToArr } = require('../utils.js');

/*
    [
        {
            I: Set(),
            next: {
                'A': 0,
                'a': 3,
            }
        },

        {

        }
    ]
*/

/**
 * 返回语法的项集族（即自动机）  返回格式如上
 * @param {*} grammerObj 
 * @param {*} START 
 * @returns 
 */
module.exports = function collection(grammerObj, START) {
    const C = [];

    // 获得非终结符集合，终结符集合
    const [V, T] = getSymbol(grammerObj);
    const allSymbol = V.concat(T);
    // console.log(V,T);

    // 添加I0
    const startProduction = `${grammerObj[START]} → · ${grammerObj[grammerObj[START]][0]}`;
    // console.log(111, startProduction);  // 例如 S1 → · S
    const I0 = closure(new Set([startProduction]), grammerObj);
    C.push({
        I: I0,
        next: {}
    });

    while (true) {
        const oldLen = C.length;

        for (let i = 0; i < oldLen; i++) {
            const I = C[i].I;  // 本次循环选的I
            // console.log('----', I)

            for (const s of allSymbol) {
                const gotoI = goto(I, s, grammerObj);
                const index = inC(gotoI, C);
                // console.log('1111', gotoI, index);

                if (gotoI.size !== 0 && index === -1) {
                    // 新获得的gotoI非空且不在集族中
                    C.push({
                        I: gotoI,
                        next: {}
                    });
                    C[i].next[s] = i + 1;
                }
                else if (gotoI.size === 0) {
                    // 为空不处理
                }
                else {
                    // 在集族中
                    C[i].next[s] = index;
                }
            }
        }

        const newLen = C.length;
        if (newLen === oldLen) break;
    }

    // console.log(C);

    // 添加到文件
    const filename = path.resolve(__dirname, '../../result/项集族C.txt');
    fs.writeFileSync(filename, JSON.stringify(setToArr(C), null, 4));  // 第三个参数格式化美观

    return C;
}


/**
 * 判断项目I是否已经存在于项目集族，存在返回下标，不存在返回-1
 * @param {*} I 
 * @param {*} C 
 */
function inC(I, C) {
    let resIndex = -1;

    C.forEach((item, index) => {
        const ISet = item.I;  // 已存在的一个ISet
        if (ISet.size === I.size) {  // 长度一样
            let flag = [...ISet].every(content => {
                if (I.has(content)) {
                    return true;
                }
                return false;
            });
            // console.log(flag);
            if (flag) {
                resIndex = index;
            }
        }
    });

    return resIndex;
}
// inC 测试
// const index = inC(new Set(['S → B · B', 'B → · a B', 'B → · b']), [
//     {
//         I: new Set(['B → b ·']),
//         next: {

//         }
//     },
//     {
//         I: new Set(['B → S ·']),
//         next: {

//         }
//     },
//     {
//         I: new Set(['S → B · B', 'B → · a B', 'B → · b']),
//         next: {

//         }
//     },
// ])

// console.log(index);
