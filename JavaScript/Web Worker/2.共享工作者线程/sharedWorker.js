/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-04 20:04:42
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-04 20:48:53
 */

let i = 0;
self.onconnect = () => console.log(`connected ${++i} times`);

// connected 1 times 
// connected 2 times 
// connected 3 times 
// connected 4 times 
// connected 5 times

// 这里根据浏览器的实现不一定能够看到打印输出

/* 
    上述发生connect事件时，SharedWorker()构造函数会隐士创建MessageChannel实例，并把MessagePort实例的所有权
    唯一的转移给该SharedWorker的实例。这个MessagePort实例会保存在connect事件对象的ports数组中。
    一个连接事件只能代表一个连接，因此可以假定ports数组的长度等于1。
    
    随着与相同共享线程连接和断开连接的页面越来越多，connectedPorts集合中会受到死端口的污染，没有办法识别它们。
    一个解决方案在beforeunload事件即将销毁页面时，明确发送卸载消息，让共享线程有机会清楚死端口。
*/


