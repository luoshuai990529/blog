/*
 * @Date: 2022-03-06 17:22:52
 * @LastEditors: Lewis
 * @LastEditTime: 2022-03-06 19:48:26
 */
var resolved = Promise.resolve(42);
var rejected = Promise.reject(-1);
var alsoRejected = Promise.reject(Infinity);

// 需要在谷歌浏览器运行代码
Promise.any([resolved, rejected, alsoRejected]).then(function (result) {
    console.log(result); // 42
});

Promise.any([rejected, alsoRejected]).catch(function (results) {
    console.log(results); // AggregateError: All promises were rejected
});
