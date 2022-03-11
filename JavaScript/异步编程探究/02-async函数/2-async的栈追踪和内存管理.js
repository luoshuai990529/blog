/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-11 14:35:47
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-11 14:38:30
 */
function fooPromiseExecutor(resolve, reject) {
    setTimeout(reject, 1000, 'bar');
}
async function foo() {
    await new Promise(fooPromiseExecutor);
}
foo();

/* 
    Uncaught (in promise) bar
    foo
    await in foo(异步)	
    foo
*/