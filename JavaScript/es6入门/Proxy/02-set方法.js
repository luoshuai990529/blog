/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-16 18:43:27
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-16 18:53:10
 */

/* 
    set方法用来拦截某个属性的赋值操作，接收4个参数依次是：目标对象、属性名、属性值、 Proxy实例本身
*/

// 01-示例
function example1() {
    let validator = {
        set: function (obj, prop, value) {
            if (prop === 'age') {
                if (!Number.isInteger(value)) {
                    throw new TypeError('The age is not an integer');
                }
                if (value > 200) {
                    throw new RangeError('The age seems invalid');
                }
            }

            // 对于满足条件的 age 属性以及其他属性，直接保存
            obj[prop] = value;
            return true;
        }
    };

    let person = new Proxy({}, validator);

    person.age = 100;

    console.log(person.age);// 100
    // person.age = 'young' // 报错
    // person.age = 300 // 报错
}

// 02-如果目标对象自身的某个属性不可写，那么set方法将不起作用。
function example2() {
    const obj = {};
    Object.defineProperty(obj, 'foo', {
        value: 'bar',
        writable: false
    });

    const handler = {
        set: function (obj, prop, value, receiver) {
            obj[prop] = 'baz';
            return true;
        }
    };

    const proxy = new Proxy(obj, handler);
    proxy.foo = 'baz'; // 报错
    // proxy.foo // "bar"
}

// 03-注意，set代理应当返回一个布尔值。严格模式下，set代理如果没有返回true，就会报错。
function example3() {
    'use strict';
    const handler = {
        set: function (obj, prop, value, receiver) {
            obj[prop] = receiver;
            // 无论有没有下面这一行，都会报错
            return false;
        }
    };
    const proxy = new Proxy({}, handler);
    proxy.foo = 'bar';
    // TypeError: 'set' on proxy: trap returned falsish for property 'foo'
}
// example3()
