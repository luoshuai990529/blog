/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-08 18:35:27
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-08 19:26:31
 */

const P = require('./bluebird')

// 先修改全局配置，让 promise 可被撤销
P.config({ cancellation: true });

function startTime(time) {
    let count = 0;
    return setInterval(() => {
        console.log('计时：', count++)
    }, time)
}
const timeId = startTime(1000)

/* 
    取消这个promise，如果这个promise已经解决，或者取消功能尚未启用，则不会执行任何操作。
*/
const getUserInfoA = () => {
    return new P((resolve) => {
        setTimeout(() => {
            resolve("A用户信息")
        }, 4000)
    })
}
const getUserInfoB = () => {
    return new P((resolve) => {
        setTimeout(() => {
            resolve("B用户信息")
        }, 6000)
    })
}
const p1 = getUserInfoA()
const p2 = getUserInfoB()

p1.then(res => {
    console.log("p1 result:", res);
    // 这里p1 的结果返回之后 我们就取消p2
    p2.cancel()
}).finally(() => {
    clearInterval(timeId)
})

p2.then(res => {
    console.log("p2 result:", res);
    return res
})
.catch(error=>{
    console.log("catch error---", error);
}).finally(() => {
    console.log("p2 finally");
    clearInterval(timeId)
})



