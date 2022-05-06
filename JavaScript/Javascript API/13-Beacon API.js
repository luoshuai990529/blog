/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-06 16:54:36
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-06 18:31:21
 */

/* 
    MDN：https://developer.mozilla.org/zh-CN/docs/Web/API/Beacon_API
    问题：在某些场景需要在卸载（unload）文档之前向服务器发送数据，这里有一个问题就是因为unload事件
    对浏览器意味着没有理由再发送网络请求，在unload事件处理程序中创建的异步请求都会被浏览器取消。
    
    为了解决上述问题，W3C 引入了补充性的 Beacon API。这个 API 给 navigator 对象增加了一个 sendBeacon()方法。
    这个简单的方法接收一个 URL 和一个数据有效载荷参数，并会发送一个 POST 请求。
        有效载荷参数：ArrayBufferView、Blob、DOMString、FormData 实例，请求成功返回true，否则返回false
        注意：
            1.sendBeacon并不是只能在页面生命周期末尾使用，而是任何时候都可以使用
            2.调用 sendBeacon()后，浏览器会把请求添加到一个内部的请求队列。然后浏览器会主动发送队列的请求
            3.浏览器保证在原始页面已经关闭的情况下也会发送请求
            4.会携带sendBeacon时的所有相关cookie
            5.状态码、网络原因早餐的失败是不透明的，不能通过编程方式处理

*/


/* 
    补充：
    在过去很多网站使用upload、beforeunload事件在会话结束时发送数据，然而这是不可靠的，
    在许多情况下（如一些移动设备）浏览器并不会产生这些事件

    因此，在浏览器会话结束时发送统计数据，最可靠的方法是在visibilitychange事件发生时发送数据：
*/
document.addEventListener('visibilitychange', function logData() {
  if (document.visibilityState === 'hidden') {
    const analyticsData = {}
    navigator.sendBeacon('/log', analyticsData);
  }
});
