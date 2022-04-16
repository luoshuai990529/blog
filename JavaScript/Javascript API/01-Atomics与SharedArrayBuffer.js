/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-16 20:05:52
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-16 22:29:36
 */
/* 
    Atomics与SharedArrayBuffer：
        多个上下文访问SharedArrayBuffer时，如果同时对缓冲区执行操作，就可能出现资源争抢问题。
        Atomics API（ES2017）通过强制同一时刻只能对缓冲区执行一个操作，可以让多个上下文安全的读写一个SharedArrayBuffer
        因为Atomics API像一个简化版的指令集架构，而原子操作的本质会排斥操作系统或计算机的自动执行的优化。如果应用不当就会导致程序执行变慢。
        所以Atomics API的设计初中是在最少但稳定的原子行为基础上，构建复杂的多线程Javascript程序
*/

/* 
    SharedArrayBuffer
        SharedArrayBuffer和 ArrayBuffer具有相同的API。
        二者的主要区别是ArrayBuffer必须在不同执行上下文间切换，SharedArrayBuffer则可以被任意多个执行上下文同时使用。
        在多个执行山西该文间共享内存意味着并发线程操作成为了可能。
        传统JavaScript操作对于并发内存访问导致的资源争用没有提供保护。
        多个工作者线程访问同一个SharedArrayBuffer就会导致资源争用问题。
        （为了解决这个问题，Atomics API应用而生。Atomics API可以保证SharedArrayBuffer上的JavaScript操作线程是安全的）

        注：SharedArrayBuffer API 等同于ArrayBuffer API。
*/