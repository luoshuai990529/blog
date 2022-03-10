<!--
 * @Date: 2022-02-28 23:11:12
 * @LastEditors: Lewis
 * @LastEditTime: 2022-02-28 23:22:35
     -->
### 概述：

异步行为是 JavaScript 的基础，但以前的实现不理想。在早期的 JavaScript 中，只支持定义回调函数 来表明异步操作完成。在ECMAScript 6中新增了正式的Promise引用类型，支持优雅地定义和组织异步逻辑。接下来又增加了 async 和 await 关键字定义异步函数的机制。现代的所有浏览器也都支持了Promise，很多浏览器的一些API如 fetch 也以此为基础。它比传统的异步解决方案(回调和事件)更加合理和强大。



##1-Promise

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



### 1.1-Promise.prototype.then()

作用：为 Promise 实例添加状态改变时的回调函数。**then**方法接收两个回调函数为参数，第一个参数是**resolved**状态的回调函数，第二个参数是**rejected**状态的回调函数，他们都是可选的。

````javascript
// 基础案例
getJSON("/post/1.json")
  .then(post => getJSON(post.commentURL))
  .then(result => console.log("resolved: ", result),err => console.log("rejected: ", err));
````



### 1.2-Promise.prototype.catch()

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



### 1.3-Promise.prototype.finally()

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



### 1.4-Promise.all()

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




### 1.5-Promise.race()

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




### 1.6-Promise.allSettled()

作用：有时候我们希望一组异步操作都结束了，不管每一个操作是成功还是失败，再进行下一步操作。但是，现有的Promise 方法很难实现这个要求，因此 [ES2020](https://github.com/tc39/proposal-promise-allSettled) 引入了 `Promise.allSettled()`，用来确定一组异步操作是否都结束了（不管成功或失败）。

用法：`Promise.allSettled()`方法接受一个数组作为参数，数组的每个成员都是一个 Promise 对象，并返回一个新的 Promise 对象。只有等到参数数组的所有 Promise 对象都发生状态变更（不管是`fulfilled`还是`rejected`），返回的 Promise 对象才会发生状态变更。

**这个方法返回的新的Promise实例，一旦状态发生改变，状态总是`fulfilled`，不会变成`rejected`。**状态变成`fulfilled`之后，它的回调函数会接收到一个数组作为参数，该数组的每个成员对应前面数组的每个Promise对象。例：

````javascript
const resolve = Promise.resolve(778)
const reject = Promise.reject(-1)

const p = Promise.allSettled([
    resolve,
    reject
])

p.then(result => {
    console.log("result--", result);
    /* 
        result: [
            { status: 'fulfilled', value: 778 },
            { status: 'rejected', reason: -1 }
        ]
    */
})
````

`results`的每个成员是一个对象，对象的格式是固定的，对应异步操作的结果。

- 异步操作成功时：`{status: 'fulfilled', value: value}`
- 异步操作失败时：`{status: 'rejected', reason: reason}`

成员对象的`status`属性的值只可能是字符串`fulfilled`或字符串`rejected`，用来区分异步操作是成功还是失败。如果是成功（`fulfilled`），对象会有`value`属性，如果是失败（`rejected`），会有`reason`属性，对应两种状态时前面异步操作的返回值。



### 1.7-Promise.any()

作用：ES2021 引入了[`Promise.any()`方法](https://github.com/tc39/proposal-promise-any)。该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例返回。

用法：同上述方法基本一致，接受一个Promise可迭代对象，只要其中一个promise成功，就返回那个已经成功的promise。如果可迭代对象中没有一个promise成功，即**全部失败**的话，那么就会返回一个失败的promise。`Promise.any()`抛出的错误，不是一个一般的Error错误对象，而是一个[AggregateError](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/AggregateError#browser_compatibility)实例。它相当于一个数组，每个成员对应一个被rejected的操作所抛出的错误。(注：`AggregateError`当多个错误需要包装在一个错误中时，该对象表示一个错误。Experimental: 这是一个实验中的功能此功能某些浏览器尚在开发中)

````javascript
var resolved = Promise.resolve(42);
var rejected = Promise.reject(-1);
var alsoRejected = Promise.reject(Infinity);

Promise.any([resolved, rejected, alsoRejected]).then(function (result) {
  console.log(result); // 42
});

Promise.any([rejected, alsoRejected]).catch(function (results) {
  console.log(results); // AggregateError: All promises were rejected
});
````



### 1.8-Promise.resolve()

有时候需要将现有对象转换为Promise对象，`Promise.resolve()`方法就起到这个作用。

`Promise.resolve('foo')`等价于`new Promise(resolve => resolve('foo'))`

`Promise.resolve`方法的参数分为四种情况:

- **参数是一个Promise实例**：如果参数是Promise实例，那么`Promise.resolve`将不做任何修改、原封不动的返回这个实例。

- **参数是一个thenable对象：**`thenable`对象指的是具有`then`方法的对象，比如：

  - ````javascript
    const thenable = {
    	then: function(resolve, reject) {
    		resolve(42)
    	}
    }
    ````

    **`Promise.resolve`方法会将这个对象转为Promise对象，然后立即执行thenable对象的then()方法**

    ````javascript
    const thenable = {
      then: function(resolve, reject) {
        resolve(42);
      }
    };

    const p1 = Promise.resolve(thenable);
    // thenable对象的then()方法执行后，对象p1的状态就变为resolved，从而立即执行最后那个then()方法指定的回调函数，输出42。
    p1.then(function (value) {
      console.log(value);  // 42
    });
    ````


- **参数不是具有 then() 方法的对象，或者根本不是对象：**如果参数是一个原始值，或者是一个不具有 then() 方法的对象，则Promise.resolve() 方法返回一个新的 Promise 对象，状态为resolved。

  - ````javascript
    const p = Promise.resolve('Hello');
    //这里生成一个新的 Promise 对象的实例p。由于字符串Hello不属于异步操作（判断方法是字符串对象不具有 then 方法），返回 Promise 实例的状态从一生成就是resolved，所以回调函数会立即执行。
    p.then(function (s) {
      console.log(s)
    });
    ````

- **不带有任何参数**：`Promise.resolve()`方法允许调用时不带参数，直接返回一个resolved状态的Promise对象。因此，如果我们得到一个Promise对象，比较方便的方法就是`Promise.resolve()`方法。

  - ````javascript
    /* 

        注意：
            立即resolve()的 Promise 对象，是在本轮“事件循环”（event loop）的结束时执行，而不是在下一轮“事件循环”的开始时。
    */

    setTimeout(function () {
        console.log("three");
    }, 0);

    Promise.resolve().then(function () {
        console.log("two");
    });

    console.log("one");

    //one
    //two
    //three
    ````




### 1.9-Promise.reject()

`Promise.reject(reason)`方法也会返回一个新的 Promise 实例，该实例的状态为`rejected`。

`Promise.reject('error')`等价于`new Promise((resolve,reject)=> reject('error'))`

`Promise.reject()`方法的参数，会原封不动地作为`reject`的理由，变成后续方法的参数。

````javascript
Promise.reject('出错了')
.catch(e => {
  console.log(e === '出错了') // true
})
````

**注意:Promise.reject 抛出的异步错误不能被 try/catch 捕获，而只能通过拒绝处理程序捕获即 .catch()**，例：

```javascript
/*
	下面的例子中，第一个try/catch 抛出并捕获了错误，第二个却没有捕获到。
	原因：reject的错误并没有抛到执行同步代码的线程里，而是通过浏览器异步消息队列来处理的。因此，try/catch块并不能捕获该错误。代码一旦开始以异步模式执行，则唯一与之交互的方式就是使用异步结构————更具体的说，就是promise的方法。
*/

try{
  throw new Error('foo'); 
} catch(e) { 
 console.log(e); // Error: foo 
} 

try { 
 Promise.reject(new Error('bar')); 
} catch(e) { 
 console.log(e); 
} 
// Uncaught (in promise) Error: bar
```





#### 对比`Promise.resolve`和`Promise.reject`：

- **Promise.resolve()**可以说是一个**幂等**的方法，这个幂等性会保留传入期约(promise)的状态。即上述promise.resolve()方法的第一种参数为promise的情况。例：

  - ```javascript
    let p = Promise.resolve(7); 
    setTimeout(console.log, 0, p === Promise.resolve(p)); 
    // true 
    setTimeout(console.log, 0, p === Promise.resolve(Promise.resolve(p))); 
    // true
    ```

- 这个静态方法可以包装任何非期约值，**包括了错误对象，并将其转换为成功的期约**。例：

  - ```javascript
    let p = Promise.resolve(new Error('foo')); 
    setTimeout(console.log, 0, p); 
    // Promise <resolved>: Error: foo
    ```

- **Promise.reject()**  并没有照搬Promise.resolve() 的幂等逻辑。如果给它传递一个期约对象，则这个期约会成为它返回的拒绝期约的理由

  - ```javascript
    setTimeout(console.log, 0, Promise.reject(Promise.resolve())); 
    // Promise <rejected>: Promise <resolved>
    ```




### 2.0-Promise.try()

[一个提案，目前还处于流程的第一阶段](https://github.com/tc39/proposal-promise-try)

实际开发中，经常遇到一种情况：不知道或者不想区分，函数`f`是同步函数还是异步操作，但是想用 Promise 来处理它。因为这样就可以不管`f`是否包含异步操作，都用`then`方法指定下一步流程，用`catch`方法处理`f`抛出的错误。一般就用下面的写法：

```javascript
// 下面的写法有个缺点，如果f是同步函数，那么它会在本轮事件循环的末尾执行。
const f = () => console.log('f now')
Promise.resolve().then(f);
console.log('next')
// next 
// now
```

那么有没有一种方法，让同步函数同步执行，异步函数异步执行，并且让其拥有统一的API呢？

- 一：用 async 函数来写：

  - ````javascript
    const f = () => console.log('now');
    (async () => f())();
    console.log('next');
    // now
    // next

    /*
    	上面的代码中，如果f是同步的，就会得到同步的结果；如果f是异步的，就可以用then指定下一步
    */
    ````

    **需要注意的是，`async () => f()`会吃掉`f()`抛出的错误。所以，如果想捕获错误，要使用`promise.catch`方法。**

    ```javascript
    (async () => f())()
    .then(...)
    .catch(...)
    ```

- 二：用new Promise() 来实现：

  - ```javascript
    const f = () => console.log('now');
    (
      () => new Promise(resolve => resolve(f()))
    )();
    console.log('next');
    // now
    // next
    ```



为了以上一种常见的需求，因此有了这一个提案，提供 Promise.try 方法代替上面的写法。

```javascript
const f = () => console.log('now');
Promise.try(f);
console.log('next');
// now
// next
```



### 来自红宝书《JavaScript高级程序设计》的补充：

ES6的Promise实现是很可靠的，但是它也有不足之处。比如，一些第三方promise库中具备的一些特性：取消promise和promise进度追踪。

1. 取消Promise

   我们经常会遇到promise正在处理过程中，程序却不需要其结果的情形。这个时候如果可以取消promise就好了。比如bluebird就提供了这个特性。实际上TC39委员会也准备添加这个特性，但是相关提案最终被撤回。最终，ES6的promise被认为是“激进的”，即只要promise一旦开始执行 就没有办法阻止它执行到完成。

   实际上，我们可以再现有的基础上进行一些临时封装，以实现取消promise的功能。这里可以用到“取消令牌”。生成的令牌实例提供了一个接口，利用这个接口可以取消promise；同时也提供了一个promise实例，可以用来触发取消后的操作并求值取消状态。

   代码示例：[可取消的promise.html](./6-可取消的promise.html)

2. promise的进度通知

   执行中的promise可能会有不少离散的“阶段”，在最终解决之前必须依次经过。某些情况下，监控promise进度会很有用。ECMAScript6 的promise并不支持 进度追踪，但是可以通过扩展来实现。

   代码示例：[promise的进度通知](./7-promise的进度通知.html)

##### 小结：

​	**ES6 不支持取消promise和进度通知，一个主要的原因就是这样会导致promise连锁和promise合成过度复杂化。比如在一个promise连锁中，如果某个被其他promise依赖的promise被取消了或者发出了通知，那么接下来应该发生什么完全说不清楚。毕竟，如果取消了Promise.all()中的一个promise，或者promise连锁中前面的promise发送了一个通知，那么接下来应该怎么办才合理呢？**





PS：以上内容绝大部分的总结其实都来自于阮一峰的《ES6入门》、《JS高级程序设计第四版》，更多细节可以书中了解学习。













