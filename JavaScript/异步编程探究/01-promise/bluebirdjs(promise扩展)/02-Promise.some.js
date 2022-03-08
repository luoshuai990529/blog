/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-08 17:18:24
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-08 17:38:32
 */
const P = require('./bluebird');

const p1 = Promise.resolve('xxx1');
const p2 = Promise.resolve('xxx2');
const reject1 = Promise.reject('reject');
const p3 = Promise.resolve('xxx3');
const p4 = Promise.resolve('xxx4');

// 下面的会返回最快的3个promise结果 four 将会打印undefined
P.some([p1, p2, reject1, p3, p4], 3).spread((first, second, third, four) => {
    console.log('result：', first, second, third, four)
}).catch(err=>{
    console.log("err:", err)
})

// 下面返回resolved最快的5个promise结果，reject1会被catch捕获
P.some([p1, p2, reject1, p3, p4], 5).spread((first, second, third, four) => {
    console.log('result：', first, second, third, four)
}).catch(err=>{
    console.log("err:", err)
})
