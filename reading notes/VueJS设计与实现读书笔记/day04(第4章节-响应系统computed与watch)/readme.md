# 响应系统的作用与实现(计算属性)

小结：

​	1.计算属性computed与lazy：前文我们知道了`effect`函数用来注册副作用函数，也允许指定一些选项参数options对象,如指定scheduler调度器来控制副作用函数的执行时机和方式；也了解了用来追踪和收集依赖的track函数，以及用来触发副作用函数重新执行的trigger函数。综合了这些内容，我们就可以实现非常重要的一个能力——计算属性。在有些场景下，我们并不希望副作用函数会立即执行，而是希望它在需要的时候才执行(计算属性)，这时我们可以通过在options对象中添加一个**新的属性 lazy** 来达到目的。lazy选项和之前的scheduler一样通过options选项对象指定。有了它我们就可以修改effect的逻辑：**当`options.lazy`为true，则不立即执行副作用函数**。而此时我们其实可以通过effect函数执行的返回值拿到对应的副作用函数`effectFn`,有了对应的副作用函数我们手动执行它即可，再接着通过了对effect再做一些修改之后做到了在手动执行副作用函数时可以拿到其返回值，将其返回值保存到res变量中，然后再将其作为`effectFn`函数的返回值。
至此，我们已经能够实现懒执行的副作用函数，并且能够拿到副作用函数的执行结果，接着便开始实现计算属性：

```javascript
function computed(getter){
    //把getter作为副作用函数，创建一个 lazy 的 effect
	const effectFn = effect(getter, { layzy: true });
	const obj = {
		// 当读取value时才执行effectFn
		get value(){
			return effectFn()
		}
	}
    return obj
}
```

上述computed函数的实现，我们已经可以通过它来创建一个计算属性了：

```javascript
const obj = new Proxy({foo: 1, bar: 2}, ...)
const sumRes = computed(() => obj.foo + obj.bar);
console.log(sumRes.value) // 3
```

这里实现的计算属性**只做到了懒计算**，即当我么真正读取`sumRes.value`的值时，它才会进行计算并且得到值。而还做不到对值的缓存。现在我们将在computed函数中添加**对值的缓存功能**：通过一个**变量value(用来缓存上一次计算的值)和dirty(用来标识是否需要重新计算，为true意味着“脏”,需要计算)**来实现。这样的话无论我们访问多少次`sumRes.value`都只会在第一次访问时进行真正的计算，后续访问都会直接读取缓存的value值。但是到这里还有一个问题即当我们修改了相关依赖后，再去访问这个计算属性的值会发现访问的值没有变化，这是因为当变量`dirty`设置为false后就不会重新计算了。解决方法也简单:**当计算属性所依赖的data发生改变时，只要将`dirty`属性的值重置为true就可以了。**应该怎么做：

```javascript
function computed(getter) { 
	let value;
	let dirty = true;
	
	const effectFn = effect(getter, {
      lazy: true,
      // 通过前小节提到的调度器函数：添加调度器，在调度器中将 dirty 属性重置为true
      scheduler(){
        dirty = true
      }
	})
	
	const obj = {
      get value() {
        if(dirty){
          value = effectFn();
          dirty = false
        }
        return value
      }
	}
	
	return obj
}
```

现在我们设计的计算属性还剩**一个缺陷**：当我们在另一个effect中读取计算属性的值时,如果此时修改`obj.foo`的值，我们期望副作用函数重新执行，即一旦计算属性发生变化就触发副作用函数的执行，但是此时并不会触发副作用函数的执行。分析原因：**本质上看这就是一个典型的`effct`嵌套，一个计算属性内部拥有自己的effect，并且它是懒执行，只有当真正读取计算属性的值时才会执行。对于计算属性的getter函数来说，它里面访问的响应式数据只会把computed内部的effect收集为依赖。而现在把计算属性用于另一个`effect`时，就会发生嵌套，外层的`effect`不会被内层`effect`中的响应式数据收集 **

```javascript
const sumRes = computed(() => obj.foo + obj.bar)
effect(() => {
	// 在该副作用函数中读取 sumRes.value
	console.log(sumRes.value)
})

// 修改 obj.foo 的值
obj.foo++
```

解决方法：**当读取计算属性的值时，我们可以手动调用`track`函数进行追踪；当计算属性依赖的响应式数据发生变化时，我们可以手动调用trigger函数触发响应：**

```javascript
function computed(getter) { 
	let value;
	let dirty = true;
	
	const effectFn = effect(getter, {
      lazy: true,
      // 通过前小节提到的调度器函数：添加调度器，在调度器中将 dirty 属性重置为true
      scheduler(){
        if(!dirty) {
			dirty = true;
            // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
          	trigger(obj, 'value')
        }
      }
	})
	
	const obj = {
      get value() {
        if(dirty){
          value = effectFn();
          dirty = false
        }
        // 当读取 value 时，手动调用 track 函数进行追踪,将计算属性返回的对象obj作为target
        // 此时，当计算属性所依赖的响应式数据发生变化时，会执行调度器函数
        track(obj, 'value')
        return value
      }
	}
	
	return obj
}
```

此时对于
```javascript
effect(() => {
	// 在该副作用函数中读取 sumRes.value
	console.log(sumRes.value)
})
```

他们会建立如下关系：
![computed](https://lewis-note.oss-cn-beijing.aliyuncs.com/github/computed.png)











