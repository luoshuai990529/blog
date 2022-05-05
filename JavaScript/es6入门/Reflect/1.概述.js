/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-05 10:43:46
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-05 11:16:17
 */

/* 
    Reflect对象与Proxy对象一样，也是 ES6 为了操作对象而提供的新 API。
    
    设计目的：
        1.将Object对象的一些明显属于语言内部的方法，放到Reflect对象上。也就是说从Reflect对象上可以拿到语言内部的方法。
        2.修改某些Object方法返回的结果，让其变得更合理。
            如Object.defineProperty(obj, name, desc)在无法定义属性时会抛出一个错误，
            而Reflect.defineProperty(obj, name, desc)则会返回false
        3.让Object操作都变成函数行为。
            如Object操作是命令式的，如 name in obj 和 delete obj[name]
            而Reflect.has(obj, name) 和 Reflect.deleteProperty(obj, name) 让其变成了函数
        4.Reflact对象的方法与Proxy对象的方法一一对应，只要是Proxy对象的方法，就能在Reflact上找到对应的方法
            也就是说，不管Proxy如何修改默认行为，你总可以在Reflact上获取默认行为。
        
        有了Reflact对象之后，很多操作会更易读
            老写法：Function.prototype.apply.call(Math.floor, undefined, [1.75]) // 1
            新写法：Reflect.apply(Math.floor, undefined, [1.75]) // 1

    Reflect 对象一共有13个静态方法，大部分和Object对象同名方法的作用都是相同的，而且它和Proxy对象的方法是一一对应的
        Reflect.apply(target, thisArg, args)
            等同于Function.prototype.apply.call(func, thisArg, args)，用于绑定this对象后执行给定函数。
        Reflect.construct(target, args)
            等同于new target(...args)，这提供了一种不使用new，来调用构造函数的方法。
        Reflect.get(target, name, receiver) 
            查找并返回target对象的name属性，如果没有该属性，则返回undefined。
        Reflect.set(target, name, value, receiver)
            设置target对象的name属性等于value。
        Reflect.deleteProperty(target, name)
            等同于delete obj[name]，用于删除对象的属性。删除成功或者被删除属性不存在返回true;删除失败返回false
        Reflect.has(target, name)
            has对应name in obj里面的in运算符
        Reflect.defineProperty(target, name, desc)
        Reflect.ownKeys(target)
        Reflect.isExtensible(target)
        Reflect.preventExtensions(target)
        Reflect.getOwnPropertyDescriptor(target, name)
        Reflect.getPrototypeOf(target)
            用于读取对象的__proto__属性，对应Object.getPrototypeOf(obj)
        Reflect.setPrototypeOf(target, prototype)
            用于设置目标对象的原型（prototype），对应Object.setPrototypeOf(obj, newProto)方法，返回true或false 表示是否成功
*/