const fs = require('fs');
const path = require('path');
const wordScanner = require('./wordScanner/index.js');
const syntactic = require('./syntactic/index.js');
const { codeList } = require('./codeGenerator/semanticAction.js');

const filename = path.resolve(__dirname, "./input/program.txt");
const content = fs.readFileSync(filename, "utf-8");

// 词法分析
const wordIterator = wordScanner(content);
console.log(wordIterator);
/*
    let data = wordIterator.next();
    while (!data.done) {
        // console.log(data);
        data = wordIterator.next();
    }
    console.log(global.symbolTable);
*/

/*
    let objStr = fs.readFileSync('./result/tokenArr.txt', { encoding: 'utf-8' });
    objStr=objStr.slice(0,-2)+']';
    const obj = JSON.parse(objStr);
    console.log(obj);
*/


// 语法分析
const flag = syntactic(wordIterator);
flag ? console.log('语法分析成功') : console.log('语法错误！！');


// 语义分析与中间代码生成
// console.log(codeList);  // 语法分析时就生成了
const codeFileName = path.resolve(__dirname, "./result/中间代码生成.txt");
fs.writeFileSync(codeFileName, '');  // 一开始不追加，清空文件
codeList.forEach(code => {
    fs.writeFileSync(codeFileName, code, {
        flag: 'a',
    })
});

// 符号表文件再次填写
const tableFilename = path.resolve(__dirname, './result/symbolTable.txt');
fs.writeFileSync(tableFilename, JSON.stringify(global.symbolTable, null, 4));
console.log(global.symbolTable)