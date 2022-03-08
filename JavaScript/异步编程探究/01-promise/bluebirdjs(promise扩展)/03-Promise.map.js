/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-08 17:40:21
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-08 18:32:16
 */
let count = 0;
const timeId = setInterval(() => {
    console.log("time:", count++)
}, 1000)


const P = require('./bluebird')
const promiseGenerator = (value, time) => new Promise(resolve => {
    setTimeout(() => resolve(value), time)
})


const list = [
    { value: "张三", time: 1000 },
    { value: "李四", time: 1000 },
    { value: "王五", time: 1000 },
    { value: "赵六", time: 1000 },
    { value: "鹰眼老七", time: 1000 },
    { value: "王八", time: 1000 },
    { value: "曾九", time: 1000 },
]

// 使用promise.all
const promises = list.map(item => promiseGenerator(item.value, item.time))
Promise.all(promises).then(result => {
    console.log("all done-", result);
})

// 使用promise.map 不限制并发数
P.map(list, (item) => {
    return promiseGenerator(item.value, item.time)
}).then(result => {
    console.log("不限制并发数 done-", result);
})

// 限制并发数为1
P.map(list, (item) => {
    return promiseGenerator(item.value, item.time)
}, { concurrency: 1 }).then(result => {
    console.log("限制并发数为1 done-", result);
    clearInterval(timeId)
})
