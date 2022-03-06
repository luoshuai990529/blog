/*
 * @Date: 2022-03-06 20:17:31
 * @LastEditors: Lewis
 * @LastEditTime: 2022-03-06 20:17:31
 */

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
