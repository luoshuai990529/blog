/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-05 11:05:53
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-05 11:19:54
 */

/* 
    观察者模式（Observer mode）指的是函数自动观察数据对象，一旦对象有变化，函数就会自动执行。

    下面使用Proxy写一个观察者模式的最简单实现，即实现observable和observe这两个函数
        思路：
            observable函数返回一个原始对象的 Proxy 代理，拦截赋值操作
            触发充当观察者的各个函数。
*/

// 定义观察者函数的集合，所有观察函数都放入这个集合
const queuedObservers = new Set(); 

const observe = fn => queuedObservers.add(fn);
const observable = obj => new Proxy(obj, { set });

function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);
    // 拦截函数set之中，会自动执行所有观察者。
    queuedObservers.forEach(observer => observer());
    return result;
}

const person = {
    name: '张三',
    score: 99
}

observe(() => console.log('成绩修改'))
observe(() => console.log("结果", JSON.stringify(person)))
const proxyPerson =  observable(person)


proxyPerson.score = 60
