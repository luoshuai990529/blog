/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-16 18:19:13
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-16 18:46:48
 */

/* 
    get方法的三个参数依次是：目标对象、属性名、proxy实例本身(操作行为所针对的对象)
*/

// 01-基本用法
function example1() {
    var person = {
        name: "张三"
    };

    //如果访问目标对象不存在的属性，会抛出一个错误。如果没有这个拦截函数，访问不存在的属性，只会返回undefined。
    var proxy = new Proxy(person, {
        get: function (target, propKey) {
            if (propKey in target) {
                return target[propKey];
            } else {
                throw new ReferenceError("Prop name \"" + propKey + "\" does not exist.");
            }
        }
    });

    console.log(proxy.name) // "张三"
    console.log(proxy.age) // 抛出一个错误
}

// 02-注意：get方法可以继承
function example2() {
    // 拦截操作定义在Prototype对象上面，所以如果读取obj对象继承的属性时，拦截会生效。
    let proxy = new Proxy({}, {
        get(target, propertyKey, receiver) {
            console.log('GET ' + propertyKey); // "GET foo"
            return target[propertyKey];
        }
    });

    let obj = Object.create(proxy);
    obj.foo
}

// 03-第三个参数的例子
function example3() {
    const proxy = new Proxy({}, {
        get: function (target, key, receiver) {
            // receiver总是指向原始的读操作所在的那个对象，一般情况下就是 Proxy 实例。
            return receiver;
        }
    });
    proxy.getReceiver === proxy // true
}

// 04-注意：如果一个属性不可配置（configurable）且不可写（writable），则 Proxy 不能修改该属性，否则通过 Proxy 对象访问该属性会报错。
function example4() {
    const target = Object.defineProperties({}, {
        foo: {
            value: 123,
            writable: false,
            configurable: false
        },
    });

    const handler = {
        get(target, propKey) {
            return 'abc';
        }
    };

    const proxy = new Proxy(target, handler);

    console.log("proxy.foo--", proxy.foo);
    // TypeError: Invariant check failed
}