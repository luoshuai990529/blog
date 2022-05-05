/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-05 11:00:28
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-05 11:00:28
 */
function Greeting(name) {
    this.name = name;
}

// new 的写法
const instance1 = new Greeting('张三');

// Reflect.construct 的写法
const instance2 = Reflect.construct(Greeting, ['张三']);