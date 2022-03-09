/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-04 17:31:56
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-09 14:54:03
 */
const resolve = Promise.resolve(778)
const reject = Promise.reject(-1)

const p = Promise.allSettled([
    resolve,
    reject
])

p.then(result => {
    console.log("result:", result);
    /* 
        result: [
            { status: 'fulfilled', value: 778 },
            { status: 'rejected', reason: -1 }
        ]
    */
})

/* 
    问题：如果当前浏览器或者node环境不支持allSettled API呢？（这是一个面试遇到过的一个问题哈哈）

    那我们可以基于Promise很简单的去自己实现一个Promise.allSettled方法
*/
const myCustomAllSettled = (promises) => Promise.all(promises.map(p => {
    return p
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
}))
const customp = myCustomAllSettled([resolve, reject]).then(res=>{
    console.log("customp result:", res);
    /* 
        customp result: [
            { status: 'fulfilled', value: 778 },
            { status: 'rejected', reason: -1 }
        ]
    */
})
// 最后我们兼容allSettled api即：
Promise.allSettled = Promise.allSettled || myCustomAllSettled