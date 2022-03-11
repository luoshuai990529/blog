## async函数要点细节补充

`async`函数的语法规则总体上比较简单，难点是错误处理机制。



### 01-返回Promise对象

- `async`函数内部`return`语句返回的值，会成为`then`方法回调函数的参数。

  - ```javascript
    async function f() {
      return 'hello world';
    }

    f().then(v => console.log(v))
    // "hello world"
    ```

- `async`函数内部抛出错误，会导致返回的 Promise 对象变为`reject`状态。抛出的错误对象会被`catch`方法回调函数接收到。

  - ```javascript
    async function f() {
      throw new Error('出错了');
    }

    f().then(
      v => console.log('resolve', v),
      e => console.log('reject', e)
    )
    //reject Error: 出错了
    ```



### 02-await 命令

- 正常情况下，await后面是一个Promise对象，返回该对象的结果。如果不是Promise对象，就直接返回对应的值。

- 另一种情况，`await`命令后面是一个`thenable`对象（即定义了`then`方法的对象），那么`await`会将其等同于 Promise 对象。

  - ```javascript
    class Sleep {
      constructor(timeout) {
        this.timeout = timeout;
      }
      then(resolve, reject) {
        const startTime = Date.now();
        setTimeout(
          () => resolve(Date.now() - startTime),
          this.timeout
        );
      }
    }

    (async () => {
      const sleepTime = await new Sleep(1000);
      console.log(sleepTime);
    })();
    // 1000
    ```

- 借助await命令可以实现一个简化的sleep方法

  - ```javascript
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const printNums = async() => {
      console.log(1);
      await sleep(500);
      console.log(2);
      console.log(3);
    };
    printNums(); // Logs: 1, 2, 3 (2 and 3 log after 500ms)
    ```

- `await`命令后面的 Promise 对象如果变为`reject`状态，则`reject`的参数会被`catch`方法的回调函数接收到。且await语句前面没有return，reject方法的参数依然会传入catch方法的回调函数。即使在await前面加上return效果也是一样的。

  - ```javascript
    async function f() {
      await Promise.reject('出错了');
    }

    f()
    .then(v => console.log(v))
    .catch(e => console.log(e))
    // 出错了
    ```

- 任何一个`await`语句后面的 Promise 对象变为`reject`状态，那么整个`async`函数都会中断执行。

  - ```javascript
    async function f() {
      await Promise.reject('出错了');
      await Promise.resolve('hello world'); // 不会执行
    }
    ```

    那么如果我们希望即使前一个异步操作失败了，也不要中断后面的异步操作。这时我们可以将第一个await放在try...catch 结构里面，这样不管这个异步操作是否成功，第二个await都会执行。

    ```javascript
    async function f() {
      // 或者这里在await 后再跟一个catch方法，处理前面可能出现的错误也可以实现此效果  
      try {
        await Promise.reject('出错了');
      } catch(e) {
      }
      return await Promise.resolve('hello world');
    }

    f()
    .then(v => console.log(v))
    // hello world
    ```



### 03-错误处理

- 如果`await`后面的异步操作出错，那么等同于`async`函数返回的 Promise 对象被`reject`。

  - ```javascript
    // async函数f执行后，await后面的 Promise 对象会抛出一个错误对象，导致catch方法的回调函数被调用，它的参数就是抛出的错误对象。
    async function f() {
      await new Promise(function (resolve, reject) {
        throw new Error('出错了');
      });
    }

    f()
    .then(v => console.log(v))
    .catch(e => console.log(e))
    // Error：出错了
    ```

- 使用`try...catch`结构，实现多次重复尝试。

  - ```javascript
    const NUM_RETRIES = 3;

    async function test() {
      let i;
      for (i = 0; i < NUM_RETRIES; ++i) {
        try {
          await Ajax.get('http://google.com/this-throws-an-error');
          break;
        } catch(err) {}
      }
      console.log(i); // 3
    }

    test();
    ```



### 04-使用注意点

- 如果有多个`await`命令后面的异步操作，如果不存在继发关系，最好让它们同时触发。(这里在Promise.all的实践应用有说到了，就不过多描述了)。

- 将`forEach`方法的参数改成`async`函数，也有问题，forEach的回调改成async函数，里面的方法也将会是并发执行，也就是同时执行。正确写法是用for循环。

  - ```javascript
    // 改写forEach的回调，下面db.post是并发执行的
    function dbFuc(db) { //这里不需要 async
      let docs = [{}, {}, {}];

      // 可能得到错误结果
      docs.forEach(async function (doc) {
        await db.post(doc);
      });
    }

    // 而用for循环就可以实现继发执行
    async function dbFuc(db) {
      let docs = [{}, {}, {}];

      for (let doc of docs) {
        await db.post(doc);
      }
    }
    ```



### 05-async 函数的实现原理

async 函数的实现原理，就是将Generator 函数和自动执行器，包装在一个函数里

> 所有的`async`函数都可以写成下面的第二种形式，其中的`spawn`函数就是自动执行器。

```javascript
async function fn(args) {
  // ...
}

// 等同于

function fn(args) {
  return spawn(function* () {
    // ...
  });
}
```

spawn函数的实现：

```javascript
function spawn(genF) {
    return new Promise((resolve, reject) => {
        const gen = genF();

        function step(nextF) {
            let next;
            try {
                next = nextF();
            } catch (e) {
                return reject(e);
            }
            if (next.done) {
                return resolve(next.value);
            }
            // next.value 是pending状态 v即完成resolved状态的结果
            Promise.resolve(next.value).then(
                (v) => step(() => gen.next(v)),
                (e) => step(() => gen.throw(e))
            )
        }

        step(() => gen.next(undefined))
    })
}
```



### 06- 停止和恢复执行

async/await 中真正起作用的是 await。async 关键字，无论从哪方面来看，都不过是一个标识符。毕竟，异步函数如果不包含 await 关键字，其执行基本上跟普通函数没有什么区别。要完全理解 await 关键字，必须知道它并非只是等待一个值可用那么简单。JavaScript 运行时在碰到 await 关键字时，会记录在哪里暂停执行。等到 await 右边的值可用了，JavaScript 运行时会向消息队列中推送一个任务，这个任务会恢复异步函数的执行。

因此，即使 await 后面跟着一个立即可用的值，函数的其余部分也会被异步求值。例：

```javascript
async function foo() {
 console.log(2); 
 await null; 
 console.log(4); 
} 
console.log(1); 
foo(); 
console.log(3);
// 1 
// 2 
// 3 
// 4

/*
	解释：
		(1) 打印 1；
        (2) 调用异步函数 foo()；
        (3)（在 foo()中）打印 2；
        (4)（在 foo()中）await 关键字暂停执行，为立即可用的值 null 向消息队列中添加一个任务；
        (5) foo()退出；
        (6) 打印 3；
        (7) 同步线程的代码执行完毕；
        (8) JavaScript 运行时从消息队列中取出任务，恢复异步函数执行；
        (9)（在 foo()中）恢复执行，await 取得 null 值（这里并没有使用）；
        (10)（在 foo()中）打印 4；
        (11) foo()返回。
*/
```

如果 await 后面是一个 promise，则问题会稍微复杂一些。此时，为了执行异步函数，实际上会有两个任务被添加到消息队列并被异步求值。下面的例子虽然看起来会反直觉，但是它演示真正的执行顺序：

```javascript
async function foo() {
   console.log(2); 
   console.log(await Promise.resolve(8)); 
   console.log(9); 
 }

async function bar(){
  console.log(4);
  console.log(await 6);
  console.log(7);
}

console.log(1);
foo();
console.log(3);
bar();
console.log(5);
// 1 
// 2 
// 3 
// 4 
// 5 
// 6 
// 7 
// 8 
// 9

/*
	解释：
		(1) 打印 1；
        (2) 调用异步函数 foo()；
        (3)（在 foo()中）打印 2；
        (4)（在 foo()中）await 关键字暂停执行，向消息队列中添加一个期约在落定之后执行的任务；
        (5) 期约立即落定，把给 await 提供值的任务添加到消息队列；
        (6) foo()退出；
        (7) 打印 3；
        (8) 调用异步函数 bar()；
        (9)（在 bar()中）打印 4；
        (10)（在 bar()中）await 关键字暂停执行，为立即可用的值 6 向消息队列中添加一个任务；
        (11) bar()退出；
        (12) 打印 5；
        (13) 顶级线程执行完毕；
        (14) JavaScript 运行时从消息队列中取出解决 await 期约的处理程序，并将解决的值 8 提供给它；
        (15) JavaScript 运行时向消息队列中添加一个恢复执行 foo()函数的任务；
        (16) JavaScript 运行时从消息队列中取出恢复执行 bar()的任务及值 6；
        (17)（在 bar()中）恢复执行，await 取得值 6；
        (18)（在 bar()中）打印 6；
        (19)（在 bar()中）打印 7；
        (20) bar()返回；
        (21) 异步任务完成，JavaScript 从消息队列中取出恢复执行 foo()的任务及值 8；
        (22)（在 foo()中）打印 8；
        (23)（在 foo()中）打印 9；
        (24) foo()返回
*/
```



### 07-利用平行执行

如果使用await时不留心，则很可能错过平行加速的机会。例：

```javascript
async function randomDelay(id) { 
 // 延迟 0~1000 毫秒
 const delay = Math.random() * 1000; 
 return new Promise((resolve) => setTimeout(() => { 
 console.log(`${id} finished`); 
 resolve(); 
 }, delay)); 
} 
async function foo() { 
 const t0 = Date.now(); 
 await randomDelay(0); 
 await randomDelay(1); 
 await randomDelay(2); 
 await randomDelay(3); 
 await randomDelay(4); 
 console.log(`${Date.now() - t0}ms elapsed`); 
} 
foo(); 
// 0 finished 
// 1 finished 
// 2 finished 
// 3 finished 
// 4 finished 
// 877ms elapsed
```

就算这些期约之间没有依赖，异步函数也会依次暂停，等待每个超时完成。这样可以保证执行顺序，但总执行时间会变长。如果顺序不是必需保证的，那么可以先一次性初始化所有期约，然后再分别等待它们的结果。例：

```javascript
async function randomDelay(id) { 
 // 延迟 0~1000 毫秒
 const delay = Math.random() * 1000; 
 return new Promise((resolve) => setTimeout(() => { 
 setTimeout(console.log, 0, `${id} finished`); 
 resolve(); 
 }, delay)); 
} 
async function foo() { 
 const t0 = Date.now(); 
 const p0 = randomDelay(0); 
 const p1 = randomDelay(1); 
 const p2 = randomDelay(2); 
 const p3 = randomDelay(3); 
 const p4 = randomDelay(4); 
 await p0; 
 await p1; 
 await p2; 
 await p3; 
 await p4; 
 setTimeout(console.log, 0, `${Date.now() - t0}ms elapsed`); 
} 
foo(); 
// 1 finished
// 4 finished 
// 3 finished 
// 0 finished 
// 2 finished 
// 877ms elapsed

// 虽然期约没有按照顺序执行，但 await 按顺序收到了每个期约的值
// awaited 0 
// awaited 1 
// awaited 2 
// awaited 3 
// awaited 4
```



### 08-栈追踪和内存管理

Promise和异步函数的功能有相当程度的重叠，但他们在内存中的表示则差别很大。

```javascript
function fooPromiseExecutor(resolve, reject) { 
 setTimeout(reject, 1000, 'bar'); 
} 
function foo() { 
 new Promise(fooPromiseExecutor); 
}
foo();
/*
    Uncaught (in promise) bar 
      setTimeout 
      setTimeout (async) 
      fooPromiseExecutor 
      foo
*/
```

栈追踪信息应该相当直接地表现 JavaScript 引擎当前栈内存中函数调用之间的嵌套关系。在超时处理程序执行时和拒绝Promise时，我们看到的错误信息包含嵌套函数的标识符，那是被调用以创建最初Promise实例的函数。可是，我们知道这些函数已经返回了，因此栈追踪信息中不应该看到它们。答案很简单，这是**因为 JavaScript 引擎会在创建Promise时尽可能保留完整的调用栈。在抛出错误时，调用栈可以由运行时的错误处理逻辑获取，因而就会出现在栈追踪信息中。当然，这意味着栈追踪信息会占用内存，从而带来一些计算和存储成本。**

```javascript
function fooPromiseExecutor(resolve, reject) { 
 setTimeout(reject, 1000, 'bar'); 
} 
async function foo() { 
 await new Promise(fooPromiseExecutor); 
} 
foo(); 
/*
	Uncaught (in promise) bar 
		foo
		async function (async) 
		foo
*/
```

这样一改，栈追踪信息就准确地反映了当前的调用栈。fooPromiseExecutor()已经返回，所以它不在错误信息中。但 foo()此时被挂起了，并没有退出。

**JavaScript 运行时可以简单地在嵌套函数中存储指向包含函数的指针，就跟对待同步函数调用栈一样。这个指针实际上存储在内存中，可用于在出错时生成栈追踪信息。这样就不会像之前的例子那样带来额外的消耗，因此在重视性能的应用中是可以优先考虑的。**



### 小结:

长期以来，掌握单线程 JavaScript 运行时的异步行为一直都是个艰巨的任务。随着 ES6 新增了期约和 ES8 新增了异步函数，ECMAScript 的异步编程特性有了长足的进步。通过期约和 async/await，不仅可以实现之前难以实现或不可能实现的任务，而且也能写出更清晰、简洁，并且容易理解、调试的代码。期约的主要功能是为异步代码提供了清晰的抽象。可以用期约表示异步执行的代码块，也可以用期约表示异步计算的值。在需要串行异步代码时，期约的价值最为突出。作为可塑性极强的一种结构，期约可以被序列化、连锁使用、复合、扩展和重组。异步函数是将期约应用于 JavaScript 函数的结果。异步函数可以暂停执行，而不阻塞主线程。无论是编写基于期约的代码，还是组织串行或平行执行的异步代码，使用异步函数都非常得心应手。异步函数可以说是现代 JavaScript 工具箱中最重要的工具之一。(《JavaScript高级程序设计》原话 哈哈)