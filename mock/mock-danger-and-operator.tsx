// @ts-nocheck 
// 可能为false的值
/**
 * false
 * 0
 * null
 * undefined
 * ""
 * ``
 * NaN
 */

// 隐式类型转换
/**
 * !!
 * Boolean
 */

// 返回 boolean的 表达式或者函数 如何区分??  判断一个函数返回值/变量 是否是 boolean
/**
 * ==
 * ===
 * >
 * >=
 * <
 * <=
 * isNaN
 * hasOwnProperty
 * include
 * some
 * every
 */

// 赋值示例
/**
 * 1. 变量的字面量
 * 2. 对象字面量
 * 3. 数组字面量
 * 4. jsx 元素的属性
 * 5. jsx 内部花括号渲染
 * 6. 函数返回值 （箭头函数简写）
 */


function fn (_t) {}

const condition1 = false
const condition2 = true

// eg.1
const temp = condition1 && condition2

// eg.2
const obj = {
    name: condition1 && 'hayden'
}

// eg.3
const arr = [ condition1 && 1 ]

// eg.4
function getSomething () {
    return condition1 && []
}

// eg.5
fn(condition2 && 'aa')

// eg.6
fn({
    age: condition2 && 10
})




