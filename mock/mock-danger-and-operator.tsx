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
 * 7. 函数参数
 */


const res = {
    data: [],
    a: {
        b: {
            c: 1
        }
    },
    disable: true
}
const isFirstSource = type === DATA_SOURCE.MYSQL && (sourceKeyIndex === 0 || sourceKeyIndex === -1)
const { a: { b: { c } } } = res
const foo = c && res.data

const obj = {
    a: {
        b: res.a.b.c.d && res.data
    }
}
const arr = [res.data && res]

const arr1 = [res.data.length && res]

function App () {
    return (
        <>
            {
                res && <span></span>
            }
            {
                res.data.length && <span></span>
            }
            <div style={ res && {} }>

            </div>
        </>
    )
}

function bar () {
    return res && res.data
}

bar(res && res.data)




