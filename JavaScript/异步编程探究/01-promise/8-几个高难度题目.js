/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-24 15:28:27
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-25 15:33:11
 */
Promise.resolve().then(() => {
    // 1-此处的Promise状态为fulfilled，因此then后立即将onFullFilled放入microtask队列，
    // 此时 microtask 只有 1的 onFulfilled：[code1]
    
    // code1... 
    console.log(0);
    return Promise.resolve(4);
}).then((res) => {
    // 2-此时上面promise的状态还是pending，所以调用then后是为上面 code1 的promise收集依赖，code1 的reactions：
    // { onFulfilled：(res) => {console.log(res)}, onRejected: undefined } 
    console.log(res)
})

Promise.resolve().then(() => {
    // 3. 同1 将onFulFilled 加入 microtask 队列，此时microtask：[code1, code2]

    // code2...
    console.log(1);
}).then(() => {
    // 4. 同2 给 code2 加reactions

    // code3...
    console.log(2);
}).then(() => {
    // 5. 同上 给 code3 加reactions

    // code4...
    console.log(3);
}).then(() => {
    // 6. 同上 给 code4 加reactions

    // code5...
    console.log(5);
}).then(() => {
    // 7. 同上 给 code5 加reactions

    // code6...
    console.log(6);
})
// 0 1 2 3 4 5 6

/* 
    原文：https://juejin.cn/post/7055202073511460895#heading-34
    
    当同步代码执行完成后，microtask 队列只有 [code1,code2]

    1.取出code1执行 输出0
    2.code1 的onFulfilled返回值是一个Promise，则会执行 ResolvePromise 的 Enqueue 代码块，会调用NewPromiseResolveThenableJobTask产生一个微任务
    3.将其微任务加入microtask队列，此时的队列：[code2,promiseResolveThenableJobTask]
    4.执行code2代码，输出1
    5.code2的onFulfilled 返回值是undefined，因此将其作为code3的值，然后将code3状态变为fulfilled，状态改变后 它的reactions也会加入microtask队列：[promiseResolveThenableJobTask，code3]
    6.取promiseResolveThenableJobTask执行，因为code1 的状态是fulfilled，因此会将其onFulfilled 加入microtask 队列：[code3,()=>Promise.resolve(4)]
    7.执行code3代码，输出2
    8.code3的onFulfilled 返回值是undefined，因此将其作为code4的值，然后将code4状态变为fulfilled，状态改变后 它的reactions也会加入microtask队列：[()=>Promise.resolve(4)，code4]
    9.()=>Promise.resolve(4)出队执行，参数是4，相当于执行了ReslovePromise(code1, 4),调用了code1 promise的resolve，此时的队列：[code4,code1]
    10.取出code4 执行，输出3
    11.去除code1 执行，值是4，因此输出 4
    12. ..... 5 6

    小结：原文讲解了V8的promise源码，了解了源码才知道上述题目的真正执行过程。
    但是！我觉得会做对我并没有啥卵用，所以不想看了  
*/


