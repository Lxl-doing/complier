const path = require('path');
const fs = require('fs');
const { isTerminator } = require('../utils.js');
const { deepClone, isChange, setToArr } = require('../utils.js');
const { getFirstOfStr } = require('./first.js');

/**
 * 输入文法、first集，返回FOLLOW集
 * @param {*} grammerObj 
 * @param {*} START 
 * @param {*} firstObj 
 */
module.exports = function getFollow(grammerObj, START, firstObj) {
    const followObj = {};  // 属性值是set

    // console.log(grammerObj);

    // 数据初始化
    Object.keys(grammerObj).forEach(it => {
        if (it != START) {
            followObj[it] = new Set();
        }
        if (it === grammerObj[START]) {
            followObj[it].add('$');
        }
    });


    // 用来对比判断是否退出循环
    let oldFollowObj = deepClone(followObj);

    // 暴力循环，任何follow集不变结束
    while (true) {

        Object.keys(grammerObj).forEach(key => {

            if (key === START) { return; }

            const rightArr = grammerObj[key];  // 左部是key的产生式右部数组

            for (let item of rightArr) {  // item即 一个 产生式右部
                const itemArr = item.split(' ');  // 一产生式右部，按空格分割，每个元素是V或T

                for (let i = 0; i < itemArr.length; i++) {
                    const V = itemArr[i];

                    if (!isTerminator(V)) {
                        // V 下面计算这个V的FOLLOW集该添加什么元素
                        const restStr = itemArr.slice(i + 1).join(' ');
                        let fArr;
                        if (restStr) {
                            fArr = getFirstOfStr(restStr, firstObj);
                            if (fArr) {
                                fArr.forEach(it => {
                                    if (it !== 'ε') {
                                        followObj[V].add(it);
                                    }
                                })
                            }
                        }

                        // 针对算法第三种情况
                        if (i === itemArr.length - 1 || fArr.includes('ε')) {
                            // console.log(key, V);
                            // console.log([...followObj[key]]);
                            [...followObj[key]].forEach(it => {  // 曾在这里打过nodeJS断点，第一次靠断点发现吃饭压键盘删去文法一个符号E1 -> E，纪念！！
                                followObj[V].add(it);
                            })
                        }
                    }
                }
            }
        });

        // console.log('迭代：', followObj)

        // 一轮过后，判断是否全不变了
        if (!isChange(oldFollowObj, followObj)) {
            break;
        } else {
            oldFollowObj = deepClone(followObj);
        }
    }

    // console.log('first: ', firstObj);
    // console.log('follow: ', followObj);

    // 添加到文件
    const filename = path.resolve(__dirname, '../../result/FOLLOW集.txt');
    fs.writeFileSync(filename, JSON.stringify(setToArr(followObj), null, 4));  // 第三个参数格式化美观

    return followObj;
}


