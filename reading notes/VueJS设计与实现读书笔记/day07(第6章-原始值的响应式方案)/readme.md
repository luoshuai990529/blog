# 原始值的响应式方案

原始值：`Boolean、Number、BigInt、String、Symbol、undefined和null` 等类型的值。在JavaScript中，**原始值是按值传递的，而非按引用传递。** 这意味着当一个函数接收原始值作为参数，那么形参和实参之间没有引用关系，它们是两个独立的值，对形参的修改不会影响实参。另外，JavaScript中的`Proxy`无法提供对原始值的代理，因此想要原始值变为响应式数据，就需要对其做一层包裹，也就是我们在Vue3中所了解的`ref`。

**1.为什么我们需要引入`ref`** ? 由于`Proxy`的代理目标必须是非原始值，所以我们没有任何手段拦截对原始值的操作，对于这个问题能想到的唯一办法是，使用一个非原始值如对象`{}`去“包裹”原始值。如果我们把这个操作暴露给用户去做的话，用户可以随意命名并不规范如`wrapper.val、wrapper.value`等；

**2.如何区分一个数据是否是`ref`**?使用`Object.defineProperty`在`wrapper`对象上定义一个不可枚举的属性`__v_isRef`，并且值为true，代表这个对象是一个`ref`，而非普通的对象。这样我们就可以通过检测`__v_isRef`属性来判断是否这个数据是ref了：

```javascript
function ref(val) {
 const wrapper = {
 	value: val
 }
 // 使用 Object.defineProperty 在 wrapper 对象上定义一个不可枚举的属性 __v_isRef，并且值为 true
 Object.defineProperty(wrapper, '__v_isRef', {
 	value: true
 })

 return reactive(wrapper)
}
```

3.**响应式丢失问题如何解决**？使用`toRef`函数，它接收两个参数第一个是一个响应式数据`obj`,第二个参数是`obj`对象的一个键。作用：基于响应式对象上的一个属性，创建一个对应的 ref。这样创建的 ref 与其源属性保持同步；如果响应式数据obj的键非常多，我们可以用`toRefs`来批量转换；
原理：

```javascript
function toRef(obj,key) {
	const wrapper = {
		get value(){
			return obj[key]
		}
	}
	return wrapper
}	
//toRefs 即逐个调用toRef完成
function toRefs(obj) {
    const ret = {}
	for(const key in obj){
    	ret[key] = toRef(obj, key)
    }
    return ret
}
```

**4.在模板中使用`ref`如何实现的自动解包？**需要使用Proxy为obj创建一个代理对象，通过代理来实现最终目标，这时就用到了上下文中介绍的ref标识，即`__v_isRef`属性，如：

```javascript
function proxyRefs(target) {
 return new Proxy(target, {
 	get(target, key, receiver) {
 		const value = Reflect.get(target, key, receiver)
 		// 自动脱 ref 实现：如果读取的值是 ref，则返回它的 value 属性值
 		return value.__v_isRef ? value.value : value
	}
    //既然读取属性的值有自动脱ref的能力，对应地，设置属性的值也应该有自动为ref设置值的能力
    set(target, key, newValue, receiver) {
 		// 通过target读取其真实值
     	const value = target[key]
        if(value.__v_isRef) {
        	value.value = newValue
            return true
        }
     	return Reflect.set(target,key,newValue,receiver)
 	}
 })
}

// 调用 proxyRefs 函数创建代理
const newObj = proxyRefs({ ...toRefs(obj) })

//我们定义了proxyRefs函数，该函数接收一个对象作为参数，并返回该对象的代理对象。代理对象的作用是拦截get操作，当读取的属性是一个ref时，则直接返回该ref的value属性值，这样就实现了自动脱ref
```



