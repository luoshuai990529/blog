/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-16 18:54:17
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-16 21:10:15
 */

/* 
    has()方法用来拦截HasProperty操作，即判断对象是否具有某个属性时，这个方法会生效。典型的操作就是in运算符。
    has()方法 接受两个参数，分别是：目标对象target、需查询的属性名key。
*/

// 01-示例
function example1() {
    var handler = {
        has(target, key) {
            console.log("target---", target, key);
            if (key[0] === '_') {
                return false;
            }
            return key in target;
        }
    };
    var target = { _prop: 'foo', prop: 'foo' };
    var proxy = new Proxy(target, handler);
    console.log('_prop' in proxy); // false
}
// example1()

// 02-如果原对象不可配置或者禁止扩展，这时has()拦截会报错。
function example2() {
    var obj = { a: 10 };
    Object.preventExtensions(obj);

    var p = new Proxy(obj, {
        has: function (target, prop) {
            return false;
        }
    });

    'a' in p // TypeError is thrown
}
example2()