# 工作者线程(Web Worker)

**前言**：常说“JavaScript 是单线程的” ，它描述了JavaScript在浏览器中的一般行为。单线程就意味着不能像多线程语言那样把工作委托给独立的线程或者进程去做。假如JS可以多线程执行并发更改，那么像DOM这样的API就会出现问题。因此，工作者线程的价值就提现出来了：**工作者线程(web workers) 允许把主线的工作转嫁给独立的实体，而不会改变现有的单线程模型。虽然各种工作者线程有不同的形式和功能，但是他们的共同的特点都是独立于JavaScript的主执行环境。**

**简介**：JavaScript环境实际上是运行在托管操作系统中的细腻环境。在浏览器中每打开一个页面，就会分配一个它自己的环境。这样，每个页面就相当于一个沙盒，不会干扰其他页面。那么使用**工作者线程(web worker)**，浏览器就可以在原始页面环境之外再分配一个完全独立的二级子环境。这个子环境不能与依赖单线程交互的API(如DOM)互操作，但可以与父环境并行执行代码。

### 1.工作者线程与执行主线程比较：

- **工作者线程是以实际线程实现的**。如，Blink浏览器引擎实现工作者线程的WorkerThread就对应着底层的线程。
- **工作者线程并行执行**。虽然页面和工作者线程都是单线程JavaScript环境，每个环境中的指令则可以并行执行。
- **工作者线程可以共享某些内存**。工作者线程能够用 SharedArrayBuffer 在多个环境间共享内容。虽然线程会使用锁实现并发控制，但JavaScript使用Atomics接口实现并发控制。
- **工作者线程不共享全部内存**。在传统线程模型中，多线程有能力读写共享内存空间。除了SharedArrayBuffer 外，从工作者线程进出的数据需要复制或转移。
- **工作者线程不一定在同一个进程里**。通常，一个进程可以在内部产生多个线程。根据浏览器引擎的实现，工作者线程可能与页面属于同一进程，也可能不属于。如Chrome的Blink引擎对共享工作者线程和服务工作者线程使用独立的进程。
- **创建工作者线程的开销更大**。工作者线程有自己独立的事件循环、全局对象、事件处理程序和其他JavaScript环境必须的特性。创建这些结构的代价不容忽视。

因此，无论形式还是功能，工作者线程都不是用于替代线程的。HTML Web工作者线程规范中说道 **工作者线程相对比较重，不建议大量使用。通常，工作者线程应该是长期运行的，启动成本比较高，每个实例占用的内存也比较大。**

### 2.工作者线程的类型：

1. **专用工作者线程**

   专用工作者线程，通常简称为工作者线程、Web Worker 或 Worker，是一种实用的工具，可以让脚本单独创建一个JavaScript线程，以执行委托的任务。专用工作者线程，顾名思义，只能被创建它的页面使用。

2. **共享工作者线程**

   共享工作者线程与专用工作者线程相似。主要区别是共享工作者线程可以被多个不同的上下文使用，包括不同的页面。任何与创建共享工作者线程的脚本同源的脚本，都可以向共享工作者线程发送消息或从中接收消息。

3. **服务工作者线程**

   服务工作者线程与专用工作者线程和共享工作者线程截然不同。它的主要用途是拦截、重定向和修改页面发出的请求，充当网络请求的仲裁者的角色。



### 3.WorkerGlobalScope:

在浏览器中，window对象可以向运行在其中的脚本暴露各种全局变量。**在工作者线程内部，没有window这个概念。这里的全局对象是WorkerGlobalScope的实例，通过self关键字暴露出来**。

##### 1.WorkerGlobalScope 属性和方法

self上可用的属性是window对象上属性的严格子集。其中有些属性会返回特定于工作者线程的版本。

navigator：返回与工作者线程关联的WorkerLocation。

self：返回WorkerGlobalScope对象。

location：返回与工作者线程关联的WorkerLocation。

performance：返回（质保函特定属性和方法的）Performance对象。

console：返回与工作者线程关联的Console对象；对API没有限制。

caches：返回与工作者线程关联的CacheStorage对象；对API没有限制。

indexedDB：返回IDBFactory对象。

isSecureContext：返回布尔值，标识工作者线程上下文是否安全。

origin：返回WorkerGlobalScope的源。

self对象上暴露的一些方法也是window上方法的子集。这些self上的方法也与window上对应的方法操作一样：

atob()、btoa()、clearInterval()、clearTimeout()、createImageBitmap()、fetch()、setInterval()、setTimeout()

WorkerGlobalScope 还增加了新的全局方法 importScripts()，只在工作者线程内可用。



##### 2.WorkerGlobalScope的子类

实际上并不是所有地方都实现了 WorkerGlobalScope。每种类型的工作者线程都使用了自己特定的全局对象，这继承自 WorkerGlobalScope。

- 专用工作者线程使用 DedicatedWorkerGlobalScope。
- 共享工作者线程使用 SharedWorkerGlobalScope。
- 服务工作者线程使用 ServiceWorkerGlobalScope。



### 4.专用工作者线程

专用工作者线程是最简单的 Web 工作者线程，网页中的脚本可以创建专用工作者线程来执行在页面线程之外的其他任务。它可以与父页面交换信息、发送网络请求、执行文件输入/输出、进行密集计算、处理大量数据，以及实现其他不适合在页面执行线程里做的任务(否则会导致页面响应迟钝)

##### 4.1 基本概念

可以把专用工作者线程称为**后台脚本**，JS线程的各个方面，都是由初始化线程时提供的脚本来控制。这个脚本也可以再请求其他脚本，但一个线程总是从一个脚本源开始。

#####4.2 创建专用工作者线程

创建专用工作者线程最常见的方式是加载JavaScript文件。把文件路径提供给Worker构造函数，然后构造函数再在后台异步加载脚本并实例化工作者线程。传给构造函数的文件路径可以是多种形式。

```javascript
// main.js
const worker = new Worker('./emptyWorker.js') // 这里要求main.js和emptyWorker.js在同一个路径下
console.log(worker) // Worker {}
```

##### 4.3 工作者线程安全限制

注意：**工作者线程的脚本只能从与父页面相同的源加载。**从其他源加载的脚本文件就会导致报错。在工作者线程内部，使用importScripts() 可以加载其他源的脚本。基于加载脚本创建的工作者线程不受文档的内容安全策略限制，因为工作者线程在与父文档不同的上下文中运行。不过，如果工作者线程加载的脚本带有全局唯一标识符(与加载自一个二进制大文件一样)，就会受父文档内容安全策略的限制。

##### 4.4 使用Worker对象

Worker() 构造函数返回的Worker对象是与刚创建的专用工作者线程通信的连接点。它可用于在工作者线程和父上下文间传输信息，以及捕获专用工作者线程发出的事件。

注意：**要管理好使用 Worker()创建的每个 Worker 对象。在终止工作者线程之前，它不会被垃圾回收，也不能通过编程方式恢复对之前 Worker 对象的引用。**

Worker对象支持的**事件处理程序属性**：

- onerror：在工作者线程中发生 ErrorEvent 类型的**错误事件**时会调用指定给该属性的处理程序。
  - 该事件会在工作者线程中抛出错误时发生。
  - 该事件也可以通过 worker.addEventListener('error', handler)的形式处理。
- onmessage：在工作者线程中发生MessageEvent类型的**消息事件**时会调用指定给该属性的处理程序。
  - 该事件会在工作者线程向父上下文发送消息时发生。
  - 该事件也可以通过使用 worker.addEventListener('message', handler)处理。
- onmessageerror：在工作者线程中发生MessageEvent 类型的**错误事件**时会调用指定给该属性的处理程序。
  - 该事件会在工作者线程收到无法反序列化的消息时发生。
  - 该事件也可以通过使用 worker.addEventListener('messageerror', handler)处理。
- postMessage()：用于通过异步消息事件向工作者线程发送信息。
- terminate()：用于立即终止工作者线程。没有为工作者线程提供清理的机会，脚本会突然停止。

##### 4.5 DedicatedWorkerGlobalScope

在专用工作者线程内部，全局作用域是**DedicateWorkerGlobalScope**的实例。因为这继承自**WorkerGlobalScope**，所以包含它的所有属性和方法。工作者线程可以通过**self**关键字访问该全局作用域。

代码：./1.专用工作者线程.html

##### 4.5 在 JavaScript 行内创建工作者线程

工作者线程需要基于脚本文件来创建，但这并不意味着该脚本必须是远程资源。专用工作者线程也 可以通过 Blob对象 URL 在行内脚本创建。这样可以更快速地初始化工作者线程，因为没有网络延迟。例：

````javascript
// 创建要执行的 JavaScript 代码字符串
const workerScript = `self.onmessage = ({data}) => console.log(data);`;
// 基于脚本字符串生成 Blob 对象
const workerScriptBlob = new Blob([workerScript]); 
// 基于 Blob 实例创建对象 URL 
const workerScriptBlobUrl = URL.createObjectURL(workerScriptBlob); 
// 基于对象 URL 创建专用工作者线程
const worker = new Worker(workerScriptBlobUrl); 
worker.postMessage('blob worker script'); 
// blob worker script
````

##### 4.6 在工作者线程中同台执行脚本

使用**importScript()方法**通过编程方式加载和执 行任意脚本。该方法可用于全局 Worker 对象。这个方法会加载脚本并按照加载顺序同步执行。

```javascript
// 例：main.js

const worker = new Worker('./worker.js'); 
// importing scripts 
// scriptA executes 
// scriptB executes 
// scripts imported
```

```javascript
// scriptA.js
console.log('scriptA executes'); 
```

```javascript
// scriptA.js
console.log('scriptA executes'); 
```

```javascript
// worker.js
console.log('importing scripts');
importScripts('./scriptA.js'); 
importScripts('./scriptB.js'); 
console.log('scripts imported');

/* importScripts()方法可以接收任意数量的脚本作为参数。浏览器下载它们的顺序没有限制，但执行则会严格按照它们在参数列表的顺序进行。
	所以上述其实可以这么写：
	importScripts('./scriptA.js', './scriptB.js'); // 效果和上述一样
*/
```

> 注：脚本加载受到常规 CORS 的限制，但在工作者线程内部可以请求来自任何源的脚本。这里的脚本导 入策略类似于使用生成的script标签动态加载脚本。

### 小结

以上内容都来自于《Javascript高级程序设计（第四版）》，可以让我们大概的了解Web Worker 是什么和基本使用。当然，在书中还介绍了很多的细节注意点，后面还有非常多的内容，这里就不一一记录了。更深入认识建议直接看书的工作者线程 这一章节。后面还列举了 委托任务到子工作者线程、处理工作者线程错误、主线程和工作者线程的通信、线程池和其他类型的工作者线程等等。





