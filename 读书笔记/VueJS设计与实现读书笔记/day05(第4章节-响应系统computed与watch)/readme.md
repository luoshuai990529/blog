# 响应系统的作用与实现(监听器)

小结：
		1.了解了计算属性computed后，现在开始了解二watch的实现原理：watch的本质就是观测一个响应式数据，当其发生变化时通知并执行相应的回调函数。**`watch`的实现本质上就是利用了`effect`以及`options.scheduler`选项**:

```javascript
effect(() => {
	console.log(obj.foo)
}, {
	scheduler(){
		// 当 obj.foo 的值发生变化时，会执行 scheduler 调度函数
	}
})
```

前面提到了在一个副作用函数中访问响应式数据`obj.foo`，这会在副作用函数与响应式数据之间建立联系，当其发生改变时会触发副作用函数重新执行。但是**如果副作用函数存在scheduler选项，当响应式数据发生变化时，会触发scheduler调度函数执行，而非直接触发副作用函数执行。**简单的watch函数实现：
```javascript
// 1-简单的watch实现
// watch函数接收两个参数，source时响应式数据，cb是回调函数
function watch(source, cb){
	effect(
		// 触发读取操作，从而建立联系
		() => source.foo,
		{
			scheduler(){
				// 当数据发生变化时，调用回调函数cb
				cb()
			}
		}
	)
}

// 2-接着作者表示当前的watch函数实现，只能观测obj.foo的改变，为了让其具有通用性，封装了一个通用的读取操作
function traverse(value, seen = new Set()){
	// 这里其实就是进行一个递归读取操作，代替上述硬编码的方式，这样就可以读取对象上的任意属性，从而当任意属性发生变化都可以触发回调函数执行。
    // code....
    // traverse(...)
    return value
}
function watch(source, cb){
	effect(
		// 调用 traverse 递归读取
		() => traverse(source),
		{
			// scheduler函数
		}
	)
}
```

watch除了可以观测响应式数据，还可以接受一个getter函数:
```javascript
watch(
	() => obj.foo, 
	() => { 
		//回调函数
		console.log('obj.foo的值变了')
    }
)
// 这里用户可以指定watch依赖哪些响应式数据，只有当这些数据发生变化时，才会触发回调函数
```

支持getter函数的实现思路：**首先判断source的类型，如果时函数，说明用户传递了getter函数，这时直接使用用户的getter函数；如果不是函数，则保留之前的做法即调用traverse函数递归读取。**

​		2.再接着作者提到了Vue.js中的监听器一个重要功能：**可以在回调函数中得到变化后的旧值和新值**。如何实现这一点：**充分利用effect函数的 `lazy` 选项，使用`lazy`选项创建一个懒执行的effect(核心改动)。手动调用`effectFn`函数得到的返回值就是旧值,即第一次执行得到的值。当变化发生并触发scheduler调度函数时，会重新调用`effectFn`函数并得到新值，这样我们就拿到了新值和旧值。**最后还提到一件**重要的事情：不要忘记使用新值更新旧值：`oldValue = newValue`,否则下一次变更发生时会得到错误的旧值**。代码：

```javascript
function watch(source, cb){
	let getter
	if(typeof source === 'function'){
		getter = source
	}else{
		getter = () => traverse(source)
	}
	// 定义旧值和新值
	let oldValue, newValue;
	// 使用effect注册副作用函数时，开启lazy选项，并把返回值存储到effectFn中以便后续手动调用
	const effectFn = effect(
		() => getter(),
		{
			lazy: true,
			scheduler() {
				// 在scheduler 中重新执行副作用函数，得到的是新值
				newValue = effectFn()
				// 将旧值和新值作为回调函数的参数
				cb(newValue, oldValue)
				// 更新旧值，不然下一次会得到错误的旧值
				oldValue = newValue
			}
		}
	)
    // 手动调用副作用函数，拿到的值就是旧值
    oldValue = effectFn()
}
```

​		3.立即执行的 watch 与回调执行时机：上述我们知道了**watch的本质其实是对effect的二次封装。**接着本节继续讨论了watch的**两个特性：a-立即执行的回调函数 b-回调函数执行的时机**。
​				**a**-在Vue.js中我们可以通**过选项参数`immediate`来指定回调是否需要立即执行**，它为true时则会在watch创建时立即执行一次。通过思考发现，回调函数的立即执行和后续执行本质上没有任何差别，因此**只需要把scheduler调度函数封装成一个通用函数，分别在初始化和变更时执行它即可。**由于其回调函数是立即执行的，因此此时的`oldValue`值为undefined，这也是符合预期的。
​				**b**-接着提到了在Vue3中可以**使用**`flush`**选项来指定回调函数的执行时机**：`flush`本质上是在指定调度函数的执行时机。前文有讲过为任务队列中执行调度函数`scheduler`，它与`flush`的功能相同。当它的值为“post”时，代表调度函数需要将副作用函数放到一个微任务队列中，并等待DOM更新结束再执行。因此我们可以修改调度器函数`scheduer`的实现方式，**在调度器内检测`options.flush`的值是否为“post”，是的话将其job函数放入微任务队列，从而实现异步延迟执行；否则直接执行job函数，本质上相当于'sync'的实现机制，即同步执行。**这里提到对于`flush`的值为"pre"时暂时无法模拟，因为它涉及到了组件的更新时机，**“pre”和“post”原本的语义即“组件更新前和更新后”**，不过这也不影响我们理解如何控制回调函数的更新时机。代码：

```javascript
function watch(source, cb, options = {}){
	// 指定其依赖的响应式数据或者getter函数 code....
	
	// 核心改动：
	// 提取scheduler 调度函数为一个独立的job函数
	const job = () => {
		newValue = effectFn()
		cb(newValue, oldValue)
		oldValue = newValue
	}
	
	const effectFn = effect(
		// 执行getter
		() => getter(),
		{
			lazy: true,
			// 使用job 函数作为调度器函数
			scheduler: () => {
				// 在调度器函数中判断flush是否为“post”，是的话将其放到微任务队列
				if(options.flush === "post"){
					const p = Promise.resolve();
					p.then(job)
				}else{
					job()
				}
			}
		}
	)
	
	// 当immediate为true时，立即执行job，从而触发回调，此时oldValue为undefined
	if(options.immediate){
		job()
	}else{
		oldValue = effectFn()
	}
	
}
```

​		4.过期的副作用：这里作者提到了**竞态问题**，作为前端工程师可能比较少讨论，因为它通常出现在多进程或者多线程编程中。**举例：**当我们监听响应式数据`obj`对象的变化，每次变化我们都发送一个网络请求，等数据请求成功之后，将其结果赋值给`finalData`变量。这时如果连续修改了两次`obj`对象的不同字段，第一次修改发送请求A，在请求A结果返回之前，我们对`obj`的某个字段进行第二次修改，这会发送请求B。此时请求A和请求B都在进行中，那么哪一个请求会先返回结果我们是不确定的，如果请求B先于请求A返回，则会导致`finalData`的变量最终存储的是A请求的结果。而这不是我们所预期的，因为请求B是后发送的，我们认为请求B返回的数据才是“最新”的，而请求A则应该被视为“过期”的，因此`finalData`存储的值应该是有请求B返回的结果。
通过思考，我们需要的是一个让副作用过期的手段。作者这里为了让问题更加清晰，拿到了Vue.js中的watch函数来复线场景，在Vue.js中watch的回调函数接收第三个参数 **`onInvalidate`**, 它是一个函数，类似与事件监听器，我们可以用它来注册一个回调，这个回调函数会在当前副作用函数过期时执行：
