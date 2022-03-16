/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-16 21:11:06
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-16 21:12:15
 */

/* 
    construct()方法用于拦截new命令，下面是拦截对象的写法。
    接受三个参数：
        目标对象target, 
        构造函数的参数数组args,
        创造实例对象时，new命令作用的构造函数newTarget

*/
function example1() {
    const p = new Proxy(function () { }, {
        // 注意1：construct()方法返回的必须是一个对象，否则会报错。
        // 注意2：由于construct()拦截的是构造函数，所以它的目标对象必须是函数，否则就会报错。
        construct: function (target, args) {
            console.log('called: ' + args.join(', '));
            return { value: args[0] * 10 };
        }
    });

    console.log((new p(1)).value);
    // "called: 1"
    // 10
}
example1()