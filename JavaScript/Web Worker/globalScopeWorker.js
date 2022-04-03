/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-30 20:18:43
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-03 21:01:38
 */
console.log("inside worker: ", self)

self.addEventListener('message', (msg) => { console.log('worker:', msg.data) })

// 向主线程发送消息
self.postMessage('sync 1')
self.close()// 关闭线程 关闭线程后，上面的message监听回调也将失效，即收不到主线程发送的消息了
self.postMessage('sync 2')
// 异步发送消息
setTimeout(() => { self.postMessage('async 3') }, 0)

/* 
    打印：
        // sync 1
        // sync 2
    虽然调用了close(),但显然工作者线程的执行并没有立即终止。close()在这里会通知工作者线程
    取消事件循环中的所有任务，并组织继续添加新任务。这也是为什么async 3没有打印的原因。
    工作者线程不需要执行同步停止，因此在父上下文的事件循环中处理的 sync 2 仍然会打印。

*/