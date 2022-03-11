/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-11 14:35:47
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-11 14:36:25
 */
function fooPromiseExecutor(resolve, reject) {
    setTimeout(reject, 1000, 'bar');
}
function foo() {
    new Promise(fooPromiseExecutor);
}
foo();

/* 
    Uncaught (in promise) bar
    setTimeout(异步)
    fooPromiseExecutor
    foo
*/