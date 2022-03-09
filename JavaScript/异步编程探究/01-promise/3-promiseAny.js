/*
 * @Date: 2022-03-06 17:22:52
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-09 20:25:30
 */
var resolved1 = Promise.resolve(10);
var resolved2 = Promise.resolve(99);
var rejected = Promise.reject(-1);
var alsoRejected = Promise.reject(Infinity);

// 需要在谷歌浏览器运行代码
// Promise.any([resolved, rejected, alsoRejected]).then(function (result) {
//     console.log(result); // 42
// });

// Promise.any([rejected, alsoRejected]).catch(function (results) {
//     console.log(results); // AggregateError: All promises were rejected
// });

/*  
    其实any和 all就是相反的
        all：只要一个失败就抛出异常，全部成功才返回成功状态
        any：只要一个成功就返回结果，只有全部失败才抛出异常
        
    手写实现 any api：
    function reverse(promise) {
        return new Promise((resolve, reject) => Promise.resolve(promise).then(reject, resolve));
    }
    function promiseAny(iterable) {
        return reverse(Promise.all([...iterable].map(reverse)));
    };
*/


// 拆分：
const reverse = (promise) => {
    return new Promise(async (resolve, reject) => {
        // console.log("reverse--", Promise.resolve(promise));
        // console.log("Promise.resolve(promise):",  Promise.resolve(promise).then(reject, resolve));
        Promise.resolve(promise).then((result) => reject(result), (reason) => resolve(reason))
    })
}

const myCustomAny = (iterable) => {
    const pormiseList = [...iterable].map(reverse)
    // console.log("pormiseList---", pormiseList);
    /* 
        1-这里把 iterable 的promise结果进行了一个反转，本来是fulfilled变成了rejected，而rejected变成了fulfilled
        Promise {<fulfilled>: -1}
        Promise {<rejected>: 99}
        Promise {<fulfilled>: Infinity}
        Promise {<rejected>: 10}
    */
    const promise = Promise.all(pormiseList)
    // console.log("promise---", promise);
    /* 
        2-promise Promise {<pending>} (rejeted 99)
    */
    return reverse(promise);
};

// myCustomAny([rejected, resolved2, alsoRejected, resolved1]).then(function (result) {
//     console.log('result:', result); // 99
// });
myCustomAny([rejected, alsoRejected]).then(function (result) {
    console.log('result:', result); // 错误 Uncaught (in promise) (2) [-1, Infinity]
});