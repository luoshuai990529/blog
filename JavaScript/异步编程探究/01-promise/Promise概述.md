<!--
 * @Date: 2022-02-28 23:11:12
 * @LastEditors: Lewis
 * @LastEditTime: 2022-02-28 23:22:35
     -->
### 概述：

异步行为是 JavaScript 的基础，但以前的实现不理想。在早期的 JavaScript 中，只支持定义回调函数 来表明异步操作完成。在ECMAScript 6中新增了正式的Promise引用类型，支持优雅地定义和组织异步逻辑。接下来又增加了 async 和 await 关键字定义异步函数的机制。现代的所有浏览器也都支持了Promise，很多浏览器的一些API如 fetch 也以此为基础。它比传统的异步解决方案(回调和事件)更加合理和强大。



### 1-Promise

````javascript
// 基础案例：异步加载图片
function loadImageAsync(url) {
  return new Promise(function(resolve, reject) {
    const image = new Image();

    image.onload = function() {
      resolve(image);
    };

    image.onerror = function() {
      reject(new Error('Could not load image at ' + url));
    };

    image.src = url;
  });
}
````



#### 1.1-Promise.prototype.then()

作用：为 Promise 实例添加状态改变时的回调函数。**then**方法接收两个回调函数为参数，第一个参数是**resolved**状态的回调函数，第二个参数是**rejected**状态的回调函数，他们都是可选的。

````javascript
// 基础案例
getJSON("/post/1.json")
  .then(post => getJSON(post.commentURL))
  .then(result => console.log("resolved: ", result),err => console.log("rejected: ", err));
````



#### 1.2-Promise.prototype.catch()

作用：用于指定发生错误时的回调函数。是**.then(null, rejection)** 或 **.then(undefined, rejection)**的别名。

````javascript
p.then((val) => console.log('fulfilled:', val))
  .catch((err) => console.log('rejected', err));

// 等同于
p.then((val) => console.log('fulfilled:', val))
  .then(null, (err) => console.log("rejected:", err));
````

> **一般来说，不要在`then()`方法里面定义 Reject 状态的回调函数（即`then`的第二个参数），总是使用`catch`方法。**

一般总是建议，Promise 对象后面要跟`catch()`方法，这样可以处理 Promise 内部发生的错误。例：

````javascript
// 下面的案例中最后错误会抛出到promise的最外层，成了未捕获的错误
const promise = new Promise(function (resolve, reject) {
  resolve('ok');
  setTimeout(function () { throw new Error('test') }, 0)
});
promise.then(function (value) { console.log(value) });
// ok
// Uncaught Error: test
````

补充：catch()方法返回的还是一个promise对象，因此后面可以接着调用.then()方法



#### 1.3-Promise.prototype.finally()

作用：指定不管 Promise 对象最后状态如何，都会执行的操作。（ES2018引入标准）

**finally**方法的回调函数不接受任何参数，这意味着没办法知道前面promise的状态，因此它不依赖于Promise的执行结果。

````javascript
// finally 本质上是then方法的特例
promise.finally(()=>{
  // code ...
})

// 等同于
promise.then(result => {
  // code ...
  return result
}, (error) => {
  // code ...
  throw error;
})
````

我们也可以自己来实现一个

````javascript
// 下面的代码中，不管前面的promise 是 成功 还是 失败，都会执行回调函数callback
// 并且finally方法总是会返回原来的值
Promise.prototype.finally = function (callback){
  let p = this.constructor;
  return this.then(
  	(value) => p.resolve(callback()).then(() => value),
  	(reason) => p.resolve(callback()).then(() => {throw reason}))
}
````



#### 1.4-Promise.all()

作用：用于将多个 Promise 实例，包装成一个新的 Promise 实例。

用法：` const p = Promise.all([p1, p2, p3])` 这句代码中，Promise.all 方法接受一个数组作为参数，p1、p2、p3都是 Promise的实例，如果不是，就会先调用下面的 **Promise.resolve**方法，将参数转为Promise实例，再进一步处理。另外，**Promise.all()** 方法的参数可以不是数组，但是必须有 **Iterator** 接口，且返回的每个成员都是Promise实例。

p 的状态由 p1、p2、p3决定，分为两种情况：

1. 只有`p1`、`p2`、`p3`的状态都变成`fulfilled`，`p`的状态才会变成`fulfilled`，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数。
2. 只要`p1`、`p2`、`p3`之中有一个被`rejected`，`p`的状态就变成`rejected`，此时第一个被`reject`的实例的返回值，会传递给`p`的回调函数。

**注意：如果作为参数的Promise实例，自己定义了catch方法，那么它一旦被rejected，并不会触发`Promise.all()`的catch方法。**

````javascript
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result)
.catch(e => e);

// p2有自己的catch方法，这个方法返回的是一个新的promise实例，这个实例执行完catch后也会变成resolved，因此会调用then方法指定的回调函数。
// 注：如果p2没有自己的catch方法的话，就会调用Promise.all() 的 catch方法
const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result)
.catch(e => e);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// ["hello", Error: 报错了]
````

实际应用场景(个人的一些经验)：

- 例1：如果当前需要请求一个商品列表的接口，需要传递两个参数a和b，而请求参数a、b分别来自于两个接口，A接口和B接口，那么我们就需要请求完A接口和B接口后得到两个接口返回的结果，我们才能去请求这个商品列表的接口，这个时候我们就可以使用`Promise.all()` 对两个请求接口 A和B 进行包装，只有当A和B接口都成功返回结果时，我们才去请求商品列表的接口。

- 例2：当我们请求两个接口，这两个接口直接没有必要的联系时，有时候我们为了让代码更好看直观可能会用上`async/await` 关键字。为了提高性能又不损失同步代码的整洁度我们也可以用promise.all 对其进行包装。 例：

  - ````javascript
    // 如果说 getUserInfo 和 getUserOrder两个接口之间没有必然的联系的话，其实我们也可以用Promise.all() 来进行包装，这样的话不仅可以并发两个请求提高了性能，同时又保证了代码直观整洁。
    async function fn1(){
      // something code...
      const userInfo = await getUserInfo();
      const userOrder = await getUserOrder();
      // something code...
    }

    //改造后
    async function fn2(){
      // something code...
      const [userInfo, userOrder] = await Promise.all([
        Promise.resolve().then(() => getUserInfo()),
        Promise.resolve().then(() => getUserOrder())
      ])
      // something code...
    }
    ````

    如果想测试可以看到 01-promiseAll.js 的demo



#### 1.5-Promise.race()

作用：同样是将多个 Promise 实例，包装成一个新的 Promise 实例

用法：`const p = Promise.race([p1, p2, p3]);`只要`p1`、`p2`、`p3`之中有一个实例率先改变状态，`p`的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给`p`的回调函数。**Promise.race()**的参数和Promise.all()的一样，如果不是Promise实例则会调用Promise.resolve() 进一步处理。

实际应用场景：

- 例1：当我们要渲染一个文章列表，此时我们有两个接口getSportsArticles和getNovalArticles分别用来获取两种不同类型的文章，这个时候产品希望如果哪个接口返回的速度快我们就用哪个接口返回的数据，这个时候我们就可以使用promise.race()来对两个请求进行包装。

- 例2：有一个接口getDataById，如果指定时间内没有返回结果的话，那么就将Promise的状态变为reject，否则resolve.

  - ````javascript
    // 下列代码，当getDataById接口超过5秒钟还没有返回结果即resolved的话，那么result则变为reject状态
    const result = await Promise.race([
       getDataById(),
       new Promise((resolve, reject) => {
         setTimeout(() => reject(new Error('request timeout')), 5000)
       })
    ])
    ````



#### 1.6-Promise.allSettled()

作用：有时候我们希望一组异步操作都结束了，不管每一个操作是成功还是失败，再进行下一步操作。但是，现有的Promise 方法很难实现这个要求，因此 [ES2020](https://github.com/tc39/proposal-promise-allSettled) 引入了 `Promise.allSettled()`，用来确定一组异步操作是否都结束了（不管成功或失败）。

用法：`Promise.allSettled()`方法接受一个数组作为参数，数组的每个成员都是一个 Promise 对象，并返回一个新的 Promise 对象。只有等到参数数组的所有 Promise 对象都发生状态变更（不管是`fulfilled`还是`rejected`），返回的 Promise 对象才会发生状态变更。









补充中...