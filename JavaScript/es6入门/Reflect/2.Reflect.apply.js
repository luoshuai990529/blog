/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-05 11:04:20
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-05 11:04:20
 */

/* 
    一般来说，如果要绑定一个函数的this对象，可以这样写fn.apply(obj, args)，
    但是如果函数定义了自己的apply方法，就只能写成Function.prototype.apply.call(fn, obj, args)，
    采用Reflect对象可以简化这种操作。
*/
const ages = [11, 33, 12, 54, 18, 96];

// 旧写法
const youngest1 = Math.min.apply(Math, ages);
const oldest1 = Math.max.apply(Math, ages);
const type1 = Object.prototype.toString.call(youngest);

// 新写法
const youngest2 = Reflect.apply(Math.min, Math, ages);
const oldest2 = Reflect.apply(Math.max, Math, ages);
const type2 = Reflect.apply(Object.prototype.toString, youngest, []);