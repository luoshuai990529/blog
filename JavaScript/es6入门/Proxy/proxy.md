## Proxy

Proxy 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。Proxy 这个词的原意是代理，用在这里表示由它来“代理”某些操作，可以译为“代理器”。

### 1.认识Proxy

在代理对象上执行的任何操作实际上都会应用到目标对象。

```javascript
/*
	构造函数接收两个参数：目标对象target和处理程序handler对象。缺少其中任何一个参数都会抛出 TypeError。
	target：可以是任何类型的对象，包括原生数组，函数，甚至另一个代理
	handler：通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理p的行为
*/
const target = { id: 'target' }
const handler = {};
const proxy = new Proxy(target, handler);
// id 属性会访问同一个值
console.log(target.id); // target
console.log(proxy.id); // target

// 给目标属性赋值会反映在两个对象上,因为两个对象访问的是同一个值
target.id = 'foo'; 
console.log(target.id); // foo 
console.log(proxy.id); // foo

// 给代理属性赋值会反应在两个对象上,因为这个赋值会转移到目标对象
proxy.id = 'bar'; 
console.log(target.id); // bar 
console.log(proxy.id); // bar

// 注意1：Proxy.prototype 是 undefined，因此不能使用 instanceof 操作符
console.log(target instanceof Proxy);// TypeError: Function has non-object prototype 'undefined' in instanceof check
console.log(proxy instanceof Proxy);// TypeError: Function has non-object prototype 'undefined' in instanceof check

// 注意2：严格相等可以用来区分代理和目标
console.log(target === proxy); // false
```

###2.Proxy支持的拦截操作（handler参数）

- **get(target, propKey, receiver)**：拦截对象属性属性的读取，如`proxy.foo`
- **set(target, propKey, value, receiver)**：拦截对象属性的设置，比如`proxy.foo = v`
- **has(target, propKey)**：拦截`propKey in proxy`的操作，返回一个布尔值。
- **deleteProperty(target, propKey)**：拦截`delete proxy[propKey]`的操作，返回一个布尔值。
- **defineProperty(target, propKey, propDesc)**：拦截`Object.defineProperty(proxy, propKey, propDesc）`、`Object.defineProperties(proxy, propDescs)`，返回一个布尔值。
- ...这里一共支持13中拦截操作，更多详情请看https://es6.ruanyifeng.com/#docs/proxy













