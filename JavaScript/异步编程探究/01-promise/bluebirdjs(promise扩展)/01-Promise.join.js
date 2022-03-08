/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-07 09:53:03
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-08 16:55:12
 */
const P = require('./bluebird')
const getName = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("张三");
        }, 1000);
    });
};
const getAge = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(18);
        }, 1000);
    });
};
const getHobby = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("篮球");
        }, 1000);
    });
};
P.join(getName(), getAge(), getHobby(), (name, age, hobby) => {
    console.log("join result-", name, age, hobby); // 张三 18 篮球
});
P.all([getName(), getAge(), getHobby()]).then((res) => {
    console.log("all result-", res); // [ '张三', 18, '篮球' ]
})