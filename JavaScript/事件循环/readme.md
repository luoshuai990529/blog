# 事件循环 Event Loop

学习目的：为了对事件循环的认知不止停留在“宏任务”与“微任务”，能够深入理解事件循环从而更好的在一些项目中更好的做一些优化，比如对一个动画需求合理的选择“requestAnimationFrame”。更深入理解JavaScript异步以及浏览器的更新渲染时机。

### 定义

[event loop](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop)： **为了协调事件，用户交互，脚本，渲染，网络等，用户代理必须使用本节所述的`event loop`。**

**事件，用户交互，脚本，渲染，网络**这些都是我们所熟悉的东西，他们都是由event loop协调的。触发一个`click`事件，进行一次`ajax`请求，背后都有`event loop`在运作。

### task任务队列(宏任务)

> 一个event loop 有一个或者多个task任务队列。当用户代理安排一个任务，必须将该任务增加到相应的event loop的一个task队列中。每一个task都来源于指定的任务源，比如可以为鼠标、键盘事件提供一个task队列，其他事件又是一个单独的队列。可以为鼠标、键盘事件分配更多的时间，保证交互的流畅。

task任务源非常宽泛，比如ajax的onload，click事件,基本上我们经常绑定的各种事件都是task任务源，以及数据库操作indexedDB。

总结来说task任务(宏任务)源：

- setTimeout
- setInterval
- [setImmediate](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setImmediate)
- I/O
- UI rendering

### microtask任务队列(微任务)

> 每一个event loop 都有一个microtask队列，一个microtask会被排进microtask队列而不是task队列。
>
> 有两种microtasks: 分别是 solitary callback microtasks 和 compound microtasks。规范只覆盖solitary callback microtasks。
>
> 如果在初期执行时，spin the event loop, microtasks 有可能被移动到常规的task队列，在这种情况下，microtasks任务源会被task任务源所用。通常情况，task任务源和microtasks是不相关的。

microtask微任务队列 和 task宏任务队列 都是先进先出的队列，有指定的任务源去提供任务，不同的是 **event loop 中只有一个microtask微任务队列**

HTML Standard没有具体指明哪些是microtask微任务任务源，通常任务是microtask任务源有：

- process.nextTick
- promises
- Object.observe
- MutationObserver

> 补充：Promise的定义在ECMAScript规范而不是在HTML规范中。在[Promise/A+规范的Notes3.1](https://promisesaplus.com/#notes)**中提及了promise的then方法可以采用“宏任务”机制或者“微任务”机制来实现**。所以promise在不同浏览器的差异正源于此，有的浏览器将then放入了宏任务队列中，有的放入了微任务队列中。在一篇博文中[Tasks, microtasks, queues and schedules - JakeArchibald.com](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)提及了一个讨论，[The "initialization" steps for Web browsers (esdiscuss.org)](https://esdiscuss.org/topic/the-initialization-steps-for-web-browsers#content-16)，**一个普遍的共识是promises属于微任务队列**



### 进一步了解Event Loop































