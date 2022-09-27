# Code Scanner
> 扫描可能会导致错误的代码

> 基于 TypeScrit 和 Babel

## 为什么不是 ESlint 插件？
ESlint 通常直接嵌入到项目中，在项目进行的过程中 ESlint 报错可能会阻塞项目的流程，比如合并代码前在 CI 中运行 ESlint 来检查代码是否有明显错误。
然而有些代码虽然看起来符合 ESlint 所配置的规则，却仍然有可能会导致不可预知的 bug。但是这些代码只是有出现问题的风险，不一定会导致 bug，因此，把这些代码的检测放到 ESlint 中是不太合适的。

<br/>

## 插件
### needTryCatch
在使用 `JSON.parse` 时，如果字符串参数不符合 json 格式，那么会直接抛出异常。React 项目中，生命周期函数内部抛出这样的异常可能会导致白屏。
当被解析的字符串的来源不确定时，应当使用 `try...catch...` 包裹 `JSON.parse` 。
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
options = {
  reactImportFile: sring; // react 包引入路径，默认是 react
}
```




