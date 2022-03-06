/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-04 17:31:56
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-04 17:37:02
 */
const resolve = Promise.resolve(778)
const reject = Promise.reject(-1)

const p = Promise.allSettled([
    resolve,
    reject
])

p.then(result => {
    console.log("result--", result);
    /* 
        result: [
            { status: 'fulfilled', value: 778 },
            { status: 'rejected', reason: -1 }
        ]
    */
})