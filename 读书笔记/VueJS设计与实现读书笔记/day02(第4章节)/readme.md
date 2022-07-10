# 第四章节：设计一个完善的响应系统

小结：

 1. 本章节开头作者从**响应式数据**和**副作用函数**开始，一步步带领我们开始了解响应系统的设计与实现。作者通过举例effect函数：**当effect函数执行时，它会直接或间接影响到了其他的函数执行，因此我们说effect函数产生了副作用，又例如一个函数修改了全局变量，那么这也是一个副作用**。让我们理解了什么是副作用函数。接着说明了什么是响应式数据：当我们希望修改字段obj.text的值之后，副作用函数会自动重新执行，如果实现了这目标，那么对象obj就是响应式数据。

 2. 接着介绍了如何拦截一个对象属性的读取和设置操作从而实现一个基本的响应式数据：在ES2015之前，只能通过`Object.defineProperty`函数实现，在ES2015+中，我们通过了代理对象`Proxy`(Vue3中采用的方式)来实现这一点。通过了Proxy对原始对象的代理，然后创建了一个用于存储副作用函数的桶bucket，它是Set类型，当读取属性时将副作用函数effect添加到 bucket桶中，当设置属性值时更新完原始数据再将副作用函数从桶里取出重新执行，就实现了响应式数据。这里作者提出了通过**‘effect’**来获取副作用函数的缺陷：**这种硬编码的方式非常不灵活。副作用函数的名字我们是可以任意取的，甚至它也可以是一个匿名函数，因此我们要想办法去掉这种硬编码的机制。**

 3. 继续完善响应式系统：上面我们已经了解了一个响应系统的工作流程：1-当读取操作发生时，将副作用函数收集到'桶'中；2-当设置操作发生时，从'桶'中取出副作用函数并执行；现在我们将解决硬编码了副作用函数的名字(effect)来带的不灵活性：这里我们**提供了一个用来注册副作用函数的机制，即用一个全局变量activeEffect存储被注册的副作用函数，定义一个effect函数接收一个函数'fn'为参数，当调用effect注册副作用函数时，将副作用函数fn赋值给activeEffect**，这样之后响应式系统就不再依赖副作用函数的名字(effect)了。接着又通过一段测试代码：在响应式数据obj上设置一个不存在的属性时，此时副作用函数却重新执行了，而这是不正确的，为此解决这个问题我们需要重新设计 “桶” 的数据结构。因为我们使用的是一个Set数据结构作为存储副作用函数的“桶”，导致该问题的根本原因是：**我们没有在副作用函数与被操作的目标字段之间建立明确的联系**，因此我们就不能用一个简单的Set类型的数据作为"桶"了。接着作者分析了一段响应式数据代码中存在的三个角色：1-被操作的代理对象obj；2-被操作的字段名text；3-使用effect函数注册的副作用函数effectFn；我们用target来表示一个代理对象所代理的原始对象，用key来表示被操作的字段名，用effectFn来表示被注册的副作用函数，那么将其三个角色建立关系(一种树形结构):![Vue4-1](https://lewis-note.oss-cn-beijing.aliyuncs.com/github/Vue4-1.png)有了这个结构，我们就可以解决上述出现的问题了，那么我们该如何实现这种结构呢？作者这里用到了**WeakMap、Map和Set**：`WeakMap`中存储的结构即 target => Map; 而`Map`中存储的结构即 key => Set 构成；这里我们把Set数据结构所存储的副作用函数集合称为**key的依赖集合**。接着作者举例代码解释了为什么要使用`WeakMap`：

    ````javascript
    const map = new Map();
    const weakmap = new WeakMap();
    (function(){
        const foo = {foo: 1}
        const bar = {bar: 2};
        map.set(foo, 1)
        weakmap.set(bar, 2)
    })()
    // 这里一旦表达式执行完，垃圾回收器会把对象bar从内存中移除，并且我们无法获取weakmap的key值，也就无法通过weakmap取得对象bar。而对于对象foo来说它仍然作为map的key被引用着，我们依然可以通过map.keys打印出对象foo。
    ````

    简述：**`WeakMap`对key是弱引用,它不会影响垃圾回收器的工作。当用户代码对一个对象没有引用关系时，WeakMap不会阻止垃圾回收器回收该对象。**所以`WeakMap`经常存储那些只有当key所引用的对象存在时(没有被回收)才有价值的信息。如果使用Map来做的话，则最终有可能导致内存溢出。最后作者还对代码进行了一些封装处理，将get拦截函数中编写把副作用收集到"桶"中的逻单独封装到了`track`函数中，同样把触发副作用方法的逻辑封装到了`trigger`函数中。

 4. 分支切换与cleanup：然后作者提到了“分支切换”的定义，即副作用effectFn函数内部存在一个三元表达式，根据obj.ok值的不同会执行不同的代码分支。当字段obj.ok的值发生变化时，代码执行的分支会跟着变化，这就是所谓的**“分支切换”。**并提出“分支切换”带来的问题：

    ```javascript
    const data = { ok: true, test: 'xxx' }
    const obj = new Proxy(data, {...})
    effect(function effectFn() {
    	document.body.innerText = obj.ok ? obj.text : 'Not'
    })
    // 上述遇到“代码分支”的情况，副作用函数effectFn 分别被字段data.ok 和 data.text 字段所对应的依赖集合收集。当obj.ok修改为false，并触发副作用函数重新执行后，由于此时字段obj.text不会被读取，只会触发字段obj.ok的读取操作，因此理想情况下副作用函数effectFn不应该被obj.text所对应的依赖集合收集。而按照之前的响应式系统实现我们还做不到这一点。
    ```

    接着并给出了解决这个问题的思路：**每次副作用函数执行时，我们可以先把它从所有与之关联的依赖集合中删除**。而要将一个副作用函数从所有与之关联的依赖集合中移除，就需要明确知道哪些依赖集合中包含它，因此重新设计副作用函数effect，为其添加了 effectFn.deps 属性，它是一个数组，用来存储所有包含当前副作用函数的依赖集合。并且它是在`track`函数中我们将当前执行的副作用函数activeEffect添加到依赖集合deps中，在执行副作用函数之前执行`cleanup`函数,将该副作用函数从依赖集合中移除,最后重置effectFn.deps数组。至此既可以避免副作用函数产生遗留了。
    到这一步其实执行示例代码会有一个死循环问题，这里作者提到了`Set.prototype.forEach`的规范，举例简短的代码来说明出现的原因：

    ```javascript
    const set = new Set(1)
    set.forEach(item => {
    	set.delete(1);
    	set.add(1);
    	console.log('循环中')
    })
    // 上面这段代码会无限循环下去，规范说明：在调用forEach遍历Set集合时，如果一个已经被访问过了，但是该值被删除并重新添加到集合，如果此时forEach遍历没有结束，那么该值会重新被访问。
    // 解决方案(trigger函数中也用同样手段解决此问题)：
    const newSet = new Set(set);
    newSet.forEach(item => {
    	set.delete(1)
        set.add(1)
        console.log('循环中')
    })
    ```

    5.嵌套的effect与effect栈：作者接着提到了effect是可以发生嵌套的，举例Vue.js的渲染函数就是一个在effect中执行的。当组件发生嵌套时 如 Foo组件渲染了Bar组件，那么此时也会发生effect嵌套。在前面1-4中实现的响应式系统中我们并不支持effect嵌套，那么我们此时会遇到一个问题：

    ```javascript
    // 全局变量
    let temp1,temp2
    // 核心代码
    efect(function effectFn1(){
    	console.log('effectFn1 执行')
    	effect(function effectFn2(){
    		console.log('effectFn2 执行')
    		temp2 = obj.bar // 在effectFn2中读取 obj.bar 属性
    	})
    	temp1 = obj.foo // 在effectFn1中读取 obj.foo 属性
    })
    //此时，我们希望修改data.foo时会触发effectFn1 执行。由于effectFn2嵌套在effectFn1里面，因此会间接触发effectFn2的执行，而当修改obj.bar时，只会触发effectFn2执行。但是实际打印情况却是：
    'effectFn1 执行'
    'effectFn2 执行'
    'effectFn2 执行'
    ```

    问题出在我们实现的`effect`函数与`activeEffect`上，**因为我们用全局变量`activeEffect`来存储通过effect函数注册的副作用函数，因此同一时刻`activeEffect`存储的副作用函数只能有一个。**当其发生嵌套时，内层副作用函数执行就会覆盖`activeEffect`的值。这时如果再有响应式数据进行依赖收集，他们收集的副作用也都是内层副作用的函数。
    解决方式：需要用到一个**副作用函数栈effectStack**，在副作用执行时，将当前副作用函数压入栈中，待副作用函数执行完毕后将其从栈中弹出，并始终让`activeEffect`指向栈顶的副作用函数。如此一来响应式数据就只会收集直接读取其值得副作用函数作为依赖，从而避免发生错乱。









