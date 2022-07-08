// semanticAction.js

const { codeList, newTemp, gen, makeList, merge, backPatch, getNextQuad } = require('./utils.js');

/* 文法与函数借助对象建立映射，属性名是产生式字符串，属性值是动作函数
   这些动作第一项都是规约后的符号 */
const production2Action = {
    'Z → P': null,
    'P → D K': null,
    'D → L id ; D': actionfunc17,
    'D → ε': null,
    'L → int': actionfunc16,
    'L → float': actionfunc16,
    'S → id = E ;': actionfunc15,
    'S → if ( C ) M S': actionfunc12,
    'S → if ( C ) M S N else M S': actionfunc13,
    'S → while M ( C ) M S': actionfunc14,
    'K → K M S': actionfunc11,
    'C → E > E': actionfunc9,
    'C → E < E': actionfunc9,
    'C → E == E': actionfunc9,
    'E → E + T': actionfunc1,
    'E → E - T': actionfunc1,
    'E → T': actionfunc3,
    'T → F': actionfunc3,
    'T → T * F': actionfunc2,
    'T → T / F': actionfunc2,
    'F → ( E )': actionfunc4,
    'F → id': actionfunc5,
    'F → digits': actionfunc5,
    'M → ε': actionfunc6,
    'N → ε': actionfunc10,
    'S → { K }': actionfunc7,
    'K → S': actionfunc8,
}


// 这些动作第一项都是规约后的符号
// const arr = [{ symbol: 'E', props: {} }, { symbol: 'E', props: {} }, { symbol: '+', props: {} }, { symbol: 'E', props: {} }]


/**
 * E → E1 + T、E → E1 - T 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组，例如[{ symbol: 'E', props: {} }, { symbol: 'E', props: {} }, { symbol: '+', props: {} }, { symbol: 'T', props: {} }]
 */
function actionfunc1(symbolObjArr) {
    const [{ props: E }, { props: E1 }, { symbol: op }, { props: T }] = symbolObjArr;  // 解构
    // console.log(E, E1, op, T);
    E.addr = newTemp();
    gen(`${E.addr} = ${E1.addr} ${op} ${T.addr}`);
}


/**
 * T → T1 * F、T → T1 / F 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组，例如[{ symbol: 'T', props: {} }, { symbol: 'T', props: {} }, { symbol: '*', props: {} }, { symbol: 'F', props: {} }]
 */
function actionfunc2(symbolObjArr) {
    const [{ props: T }, { props: T1 }, { symbol: op }, { props: F }] = symbolObjArr;  // 解构
    T.addr = newTemp();
    gen(`${T.addr} = ${T1.addr} ${op} ${F.addr}`);
}


/**
 * E → T、T → F 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组，例如[{ symbol: 'T', props: {} }, { symbol: 'F', props: {} }]
 */
function actionfunc3(symbolObjArr) {
    const [{ props: E }, { props: T }] = symbolObjArr;  // 解构
    E.addr = T.addr;
}


/**
 * F → ( E ) 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组。 映射到符号对象的symbol的数组：[F, (, E, )]
 */
function actionfunc4(symbolObjArr) {
    const [{ props: F }, , { props: E }] = symbolObjArr;  // 解构
    F.addr = E.addr;
}


/**
 * F → id、F → digits 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组， 例如[{ symbol: 'F', props: {} }, { symbol: 'id', props: {lexeme: a} }]
 */
function actionfunc5(symbolObjArr) {
    const [{ props: F }, { props: id }] = symbolObjArr;  // 解构
    F.addr = id.lexeme;
}


/**
 * M → ε 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组， 例如[{ symbol: 'M', props: {} }]
 */
function actionfunc6(symbolObjArr) {
    const [{ props: M }] = symbolObjArr;  // 解构
    M.quad = getNextQuad();
}


/**
 * S → { K } 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc7(symbolObjArr) {
    const [{ props: S }, , { props: K }] = symbolObjArr;  // 解构
    S.nextList = K.nextList;
}


/**
 * K → S 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc8(symbolObjArr) {
    const [{ props: K }, { props: S }] = symbolObjArr;  // 解构
    K.nextList = S.nextList;
    // console.log(2222222222222222222, S.nextList, getNextQuad());
    // backPatch(S.nextList, getNextQuad());
}


/**
 * C → E > E、C → E < E、C → E == E 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc9(symbolObjArr) {
    const [{ props: C }, { props: E1 }, { symbol: op }, { props: E2 }] = symbolObjArr;  // 解构
    C.trueList = makeList(getNextQuad());
    C.falseList = makeList(getNextQuad() + 1);
    gen(`if ${E1.addr} ${op} ${E2.addr} goto $`);
    gen(`goto $`);
}


/**
 * N → ε 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc10(symbolObjArr) {
    const [{ props: N }] = symbolObjArr;  // 解构
    N.nextList = makeList(getNextQuad());
    gen(`goto $`);
}


/**
 * K → K M S 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc11(symbolObjArr) {
    const [{ props: K }, { props: K1 }, { props: M }, { props: S }] = symbolObjArr;  // 解构
    backPatch(K1.nextList, M.quad);
    K.nextList = S.nextList;
    backPatch(S.nextList, getNextQuad());
}


/**
 * S → if ( C ) M S 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc12(symbolObjArr) {
    const [{ props: S }, , , { props: C }, , { props: M }, { props: S1 }] = symbolObjArr;  // 解构
    backPatch(C.trueList, M.quad);
    S.nextList = merge(C.falseList, S1.nextList);
}


/**
 * S → if ( C ) M S N else M S 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc13(symbolObjArr) {
    const [{ props: S }, , , { props: C }, , { props: M1 }, { props: S1 }, { props: N }, , { props: M2 }, { props: S2 }] = symbolObjArr;  // 解构
    backPatch(C.trueList, M1.quad);
    backPatch(C.falseList, M2.quad);
    S.nextList = merge(merge(S1.nextList, N.nextList), S2.nextList);
}


/**
 * S → while M ( C ) M S 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc14(symbolObjArr) {
    const [{ props: S }, , { props: M1 }, , { props: C }, , { props: M2 }, { props: S1 }] = symbolObjArr;  // 解构
    backPatch(S1.nextList, M1.quad);
    backPatch(C.trueList, M2.quad);
    S.nextList = C.falseList;
    gen(`goto ${M1.quad}`);
}


/**
 * S → id = E ; 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc15(symbolObjArr) {
    const [{ props: S }, { props: id }, , { props: E }] = symbolObjArr;  // 解构
    const p = id.lexeme;
    if (!p) throw new Error('中间代码生成失败，符号表中找不到此id对应的标识符');
    gen(`${p} = ${E.addr}`);
}

/**
 * L → int、L → float 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc16(symbolObjArr) {
    const [{ props: L }, { symbol: type }] = symbolObjArr;  // 解构
    L.type = type;
}


/**
 * D → L id ; D 规约后动作
 * @param {*} symbolObjArr 符号对象 {symbol: 'x', props: {}} 数组
 */
function actionfunc17(symbolObjArr) {
    const [, { props: L }, { props: id }] = symbolObjArr;  // 解构
    global.symbolTable[id.lexeme].vType = L.type;  // 回填符号表
}

module.exports = {
    production2Action,
    codeList,
}