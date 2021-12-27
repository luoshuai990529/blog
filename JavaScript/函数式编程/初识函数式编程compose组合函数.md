<!--
 * @Date: 2021-12-20 16:31:01
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2021-12-23 09:33:20
     -->

### 前置知识

#### 1.函数式编程( FP ) 概述

函数式编程已经不再是一个新的概念，它具有完善清晰的原则，如果我们可以理解这些原则，我们就能很方便的读懂代码合定为问题。函数式编程目的是为了数据流更加明显，从而代码更具可读性

思考：下面是两种不同的修改x的值的代码写法

```javascript
let x = null;
function foo(y){
  x = Math.floor(Math.random()*y)
}
foo(11)
x; 
```

```javascript
let x = null;
function foo(){
  return Math.floor(Math.random()*y)
}
x = foo(11)
x;
```

上面的案例中，第一种给x 赋值是**隐式**的输出，而第二种通过return是一个**显式**的输出

何为**隐式**和**显式**？看下一段代码

```javascript
function sum(list){
	const total = 0;
  	for(let i = 0; i < list.length; i++){
        if(!list[i]) list[i] = 0 // list 使用了 nums 的引用
    	total += list[i]
    }
    return total
}
let nums = [1,2,3,null,5]
sum(nums) // 11
```

上面的代码中，函数**sum**除了return输出，其实还是有其他的操作修改到了外部参数nums, 即便是我们无意的修改了nums中的值，在JS中对数组、对象、函数都是用引用和引用复制，我们可以很容易地从函数中创建输出，即使是无心的。(拓展：理解**可变数据的副作用** ，以及**不可变数据** 的解决方案：浅复制、深克隆、**Immer.js**、**immutability-helper** 等库帮助编写可读性高的代码，并且不会失去immutability-不可变性带来的好处)

这个隐式函数输出在函数式编程中有一个特殊的名称：**副作用**

而没有副作用的函数也有一个特殊的名称：**纯函数**

#### 2-理解柯里化curry&偏函数partial

柯里化：柯里化是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。

例：

```javascript
// from https://www.30secondsofcode.org/js/s/curry
const curry = (fn, arity = fn.length, ...args) =>
  arity <= args.length ? fn(...args) : curry.bind(null, fn, arity, ...args);
// 下面是一个累加求和的函数
function add(a,b,c,d,e){
	return [a, b, c, d, e].reduce((a, b) => {
          return a + b;
    });
}
add(1,2,3,4,5) // 15
// 通过curry工具函数 将add函数柯里化之后返回一个新的函数，便可以一个个传参
const curryAdd = curry(add)
curryAdd(1)(2)(3)(4)(5) // 15
```

偏函数：减少函数的输入参数的个数。

例：

```javascript
// from https://www.30secondsofcode.org/js/s/curry
const partial = (fn, ...partials) => (...args) => fn(...partials, ...args);
const partialRight = (fn, ...partials) => (...args) => fn(...args, ...partials);
// 比如我们现在封装了一个ajax请求函数
function ajax(url,data,cb){
	//...
}
// 当我们已经知道url参数，但是data和cb还不能确定，这时候我们可以创建一个新的函数进行包装
function getUserInfo(data,cb){
	ajax('/api/getUserInfo',data,cb)
}
// 当然，我们也可以使用partial来对上面ajax进行包装,此时的partialGetUserInfo和上面的getUserInfo一样变成了接收data、cb的函数
const partialGetUserInfo = partial(ajax,'/api/getUserInfo')
```

小结：

1. 可以理解柯里化add(1)(2)(3) 是一种特殊的偏函数partial(add,1,2)(3)
2. 偏函数或柯里化，可以将“指定分离实参”的时机和地方独立开来,其实都是为了后续我们进行更好的组合函数

3. 对函数进行包装，使其成为一个**高阶函数** 是函数式编程的精髓

提示：

 - 以上的柯里化和偏函数 工具函数代码都来自https://www.30secondsofcode.org/，里面还有一些其他代码案例，就没有在上述代码中一一展示了
 - 如果你是一个函数式编程的初学者 或者看完上面这些概念还是很懵逼的话，可以尝试去掘金等社区搜索相关的关键词(**柯里化、偏函数、高阶函数、不可变数据**...) 观看更多的案例来加深理解

​      

#### 3-组合函数Compose

3.1-我们认识完函数式编程的一些基本概念以及柯里化和偏函数这类高阶包装函数，其实都是为了让这些单元函数便于后续进行组合，正是现在的**组合函数Compose(重要)** 

首先我们先来通过一个最简单的代码示例来初步认识一下compose的使用，例：

```javascript
// 这是一个compose函数，通过reduce实现，也是来自于 30secondsofcode
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const a = () => console.log(1);
const b = () => console.log(2);
const c = () => console.log(3);
compose(a,b,c)() // 依次打印 3、2、1

// 以上展示了compose组合函数的一个很基础的案例，如果不是很理解，我们也可以把compose组合后的代码拆开来看看发生了啥：
const K = compose(a,b) 
// 其实就等价于
const K = (...args) => a(b(...args));
// ---------------------------------------------
const X = compose(K,c) 
// 就等价于
const X = (...args) => K(c(...args))
// ---------------------------------------------由此可以推断
compose(a,b,c)
// 就等价于
(...args) => a(b(c(...args)))
```

实际应用中可能遇到的情况，例：

```javascript
function getAppIdByUserId(userId){
  // 根据用户Id获取appid.....
  const appid = 'appid-userId'
  return appid
}
function getAccessTokenByAppId(appId){
  // 根据appId获取accessToken....
  const accessToken = 'accessToken-appId'
  return accessToken
}
function sendMsgByAccessToken(accessToken){
  // 根据accessToken发送消息....
  const result = { msg:'发送成功', code:200, accessToken}
  return result
}
// 版本1：
const userId = 1
const appId = getAppIdByUserId(userId)
const accessToken = getAccessTokenByAppId(appId)
const sendResult = sendMsgByAccessToken(accessToken)

// 版本2：上面依次调用了三个函数发送了一个消息，如果为了减少中间变量我们可以改成如下调用：
const sendResult = sendMsgByAccessToken(getAccessTokenByAppId(getAppIdByUserId(userId)))

// 版本3：当然我们也可以把整个流程封装到一个函数内：
function sendMessageByUserId(userId){
  return sendMsgByAccessToken(getAccessTokenByAppId(getAppIdByUserId(userId)))
}

/**
    版本4：利用compose函数来进行组合
    首先我们先实现一个compose函数(来自 https://www.30secondsofcode.org/js/s/compose)
	注意：
	  1-最后一个（最右边的）函数可以接受一个或多个参数； 其余的函数必须是一元的。因为其他函数都只能接收       上一个函数的返回值，即只能接收一个参数，因此sendMsgByAccessToken和getAccessTokenByAppId都只能
	  是一元的。
	  2-30secondsofcode还提供了一个composeRight用于执行从左到右的函数组合。而compose用于执行从右到左       的函数组合。
**/
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const sendMessageById = compose(sendMsgByAccessToken,getAccessTokenByAppId,getAppIdByUserId)

// 5-拓展：compose结合偏函数 partial 特性还可以实现更多场景
function subscribeMsgByAccessToken(accessToken){
  //通过accesstoken订阅消息....
  return {msg:'订阅成功',code:200 ,accessToken}
}
const partialRight = (fn, ...partials) => (...args) => fn(...args, ...partials);
// 用partialRight 是因为compose组合顺序我们应该从最右开始，当然也可以换成partial+composeRight
// getAccessTokenAfter 此时接收一个 通过accesstoken做任意事情的 函数，并返回一个函数
const getAccessTokenByUserId = partialRight(compose,getAccessTokenByAppId,getAppIdByUserId)

const sendMsgByUserId = getAccessTokenAfter(sendMsgByAccessToken)
const subscribMsgByUserId = getAccessTokenAfter(subscribeMsgByAccessToken)

sendMsgByUserId(userId)// {msg: '发送成功', code: 200, accessToken: 'accessToken-appid-1'}
subscribMsgByUserId(userId) // {msg: '订阅成功', code: 200, accessToken: 'accessToken-appid-1'}

```

**3.2- 以上代码案例compose函数都是组合同步的操作，往往实战中我们都需要异步函数来操作，那么我们就需要一个异步的composePromise来解决**

例：

```JavaScript
const a = async(count)=>{
  return new Promise((resolve,reject) => {
    setTimeout(()=>{
      console.log("5秒----xhr a", count + 5);
      resolve({result:count + 5,from:'xhr a'})
    }, 5000)
  })
}

const b = async(res)=>{
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      console.log("3秒----xhr b",res.result + 5);
      resolve({result:res.result + 5,from:'xhr b'})
    },3000)
  })
}

const c = async(res)=>{
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      console.log("1秒----xhr c",res.result + 5);
      resolve({result:res.result + 5,from:'xhr c'})
    },1000)
  })
}

/* 
   pipeAsyncFunctions 为异步函数执行从左到右的函数组合。
   注意：
     1-所有函数都必须接受一个参数。
*/

const pipeAsyncFunctions = (...fns) => arg => fns.reduce((p, f) => p.then(f), Promise.resolve(arg));

const newComposeFn = pipeAsyncFunctions(a,b,c)
newComposeFn(10).then((res)=>{
  console.log("res---",res);
})
// 5秒----xhr a 15
// 3秒----xhr b 20
// 1秒----xhr c 25
// res--- {result: 25, from: 'xhr c'}
```

小结：

       	1. **组合 ———— 声明式数据流 ———— 是支撑函数式编程其他特性的最重要的工具之一**
       	2. 函数组合是为了符合“声明式编程风格”，即关注“是什么”，而非具体“做什么”。如下面ES6新增的解构语法


```javascript
function getData() {
    return [1,2,3,4,5];
}

// 命令式
var tmp = getData();
var a = tmp[0];
var b = tmp[3];

// 声明式
var [ a ,,, b ] = getData();
```

#### 总结

以上内容算是能基本认识到函数式编程，遇到同类型写法的代码或者是一些相关的概念也不会一脸懵逼了，或许在实际应用中也可以通过这些思想来帮助我们编写更易读和易于维护的代码，当然并不是所有的人都可以理解这种写法用的不好反而会增加他人阅读的难度，因此对于不同的场景需要不同的应对。

其实我们认识到这些基础概念和一些函数式编程常用的工具函数之后，如果想要更深入的学习可以学习一下 **koa、redux** 等优秀开源库的源码以及**webpack的Tapable库**，里面很多实现比如koa中间件的原理....等等都能看到同步或异步compose的身影，后期我也会做一个关于这些库源码阅读总结来提升对compose这些函数的理解，当然这上面很多也是我自己的个人理解其实也参照了许多作者的文章，或多或少会漏掉一些内容或者知识点，又或者有些地方描述的不是很清晰，如果小伙伴们想要深度了解可以自己去掘金、github等论坛查找更多相关资料，以上参考文章：

https://www.30secondsofcode.org/js/s/compose：30 seconds of code

https://juejin.cn/post/6968259661304692750：《01-JS函数式编程看这一篇就够了》

https://juejin.cn/post/6969016132741103624：《02-JS函数式编程看这一篇就够了》

https://juejin.cn/post/6971260867300032525：《03-JS函数式编程看这一篇就够了》

https://juejin.cn/post/6989020415444123662：《感谢 compose 函数，让我的代码屎山💩逐渐美丽了起来》

....更多可以掘金、YouTube 搜索 函数式编程、compose、柯里化、偏函数等关键词