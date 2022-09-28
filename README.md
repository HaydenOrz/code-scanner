# Code Scanner
> 扫描可能会导致错误的代码，基于 TypeScript 和 Babel

## 为什么不是 ESlint 插件？
ESlint 通常直接嵌入到项目中，在项目进行的过程中 ESlint 报错可能会阻塞项目的流程，比如合并代码前在 CI 中运行 ESlint 来检查代码是否有明显错误。
然而有些代码虽然看起来符合 ESlint 所配置的规则，却仍然有可能会导致不可预知的 bug。但是这些代码只是有出现问题的风险，不一定会导致 bug，因此，把这些代码的检测放到 ESlint 中是不太合适的。

<br/>

## 使用
1. 下载
```shell
git@github.com:HaydenOrz/code-scanner.git
```
2. 安装依赖
```shell
pnpm install
```
3. 配置
```js
// src/index.ts
new Runner({
    includes: pattern, // 想要扫描的文件，glob 模式
    scanPlugins: [ // 扫描插件
        {
            plugin: 'needTryCatch'
        },
        {
            plugin: 'needHandlerInCatch', // 插件名称
            options: { // 插件配置
                reactImportPath: 'react'
            }
        },
        {
            plugin: 'dangerousAndOperator'
        }
    ]
})
```



## 插件
### needTryCatch
在使用 `JSON.parse` 时，如果字符串参数不符合 json 格式，那么会直接抛出异常。React 项目中，生命周期函数内部抛出这样的异常可能会导致白屏。
当被解析的字符串的来源不确定时，应当使用 `try...catch...` 包裹 `JSON.parse` 。

#### Case
+ 错误示例1 🚫
```js
function foo (jsonStr) {
  JSON.parse(jsonStr)
}

foo()
```
+ 错误示例2 🚫
```js
function foo (jsonStr) {
  JSON.parse(jsonStr)
}

try {
  foo()
} catch(err) {
  console.error(err)
}
```
+ 正确示例 ✅
```js
function foo (jsonStr) {
  try {
    JSON.parse(jsonStr)
  } catch(err) {
    console.error(err)
  }
}

foo()
```

<br/>

### needHandlerInCatch
在异常捕获代码块中，必须要有处理异常情况的代码，原因是：
1. 如果没有处理异常情况，那么当程序产生异常时，可能有不可预知的 bug；
2. 第二，在生产环境中，通常没有 sourceMap，此时如果异常没有处理也没有打印出来，当程序产生 bug 时，难以定位问题所在；

#### Case
1. try...catch...
```js
try {
  // some dangerous code
} catch () {
  // Some code handling is required
}
```
2. promise.catch()
```js
Promise.reject()
.catch(e => {
  // Some code handling is required
})
```
3. componentDidCatch lifeSycle of React
```js
class App extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Some code handling is required
  }
}
```

#### 插件配置
```js
const options = {
  reactImportFile: sring; // react 包引入路径，默认是 react
}
```

### dangerousAndOperator
在某些情况下，使用 `&&` 语句作为值是一个危险操作
> PS: 绝大部份情况下，如果代码有完整的 TS 类型定义，是不会出现这种情况的
#### Case
1. setState 更新状态
```js
const res = await Api.getXXX()
this.setState({
  dataSource: res.data && res.data.data
})
/**
 * 如果 dataSource 是一个数组类型，而res.data的值可能为 null，那么就有出现bug的风险，
 * 正确的做法是在给 dataSource 赋值的时候就处理掉数据不存在的情况，而不是在使用 dataSource 的地方去处理 
 */ 
```
对象字面量，数组字面量，变量赋值，函数 return 等场景下同上。

2. JSX 中使用 `.length && XXX`

```jsx
render () {
  const { data } = this.state
  return (
    data?.length && (
      <div>...</div>
    )
  )
}
/**
 * 当data是一个空数组时，页面上这里会显示成 0 
 */
```







