# 渲染器的设计

Vue中很多功能依赖渲染器来实现，如`Transition、Teleport、Suspense`组件，以及template ref 和自定义指令等。渲染器也是框架的核心，它的实现直接影响框架性能，Vue3的渲染器不仅仅包含传统的Diff算法，还独创了快捷的更新方式，能够充分利用编译器提供的信息，提高了性能。

顾名思义，渲染器是用来执行渲染任务的。在浏览器平台上用它来渲染其中的真实DOM元素。它不仅能渲染真实DOM，还是框架跨平台能力的关键，因此在设计渲染器的时候考虑了可自定义的能力。

基本概念：**渲染器(renderer)：作用是把虚拟DOM渲染为特定平台上的真实元素。在浏览器平台上，渲染器会把虚拟DOM渲染为真实DOM元素。**

源码中会通过一个**`createRenderer()`**函数来创建一个渲染器，它返回`render、hydrate`两个函数，后者用于服务端渲染。在Vue3中，创建应用的`createApp`函数也是渲染器的一部分。在实现`createRenderer`时将依赖浏览器平台的一些特有API都进行了抽象成可配置的操作，以至于我们实现自定义的行为让其可以跨平台运行。

当我们首次调用渲染器的render函数执行渲染的时候，只需要创建新的DOM元素即可，这个过程只涉及挂载，当多次在同一个容器中渲染时，除了挂载动作之外还要执行更新，会根据新节点和旧节点进行比较，试图找到并更新变更点。这个过程叫做**打补丁(patch函数:整个渲染器的核心入口)**。

**要点1：如何用`VNode`描述一个标签的属性、事件？**

```javascript
const Text = Symbol();
const Comment = Symbol();
const Fragment = Symbol();
const vnode = {
	type: 'div',
    // 使用 props 描述一个元素的属性
    props: {
    	id: 'app',
        class: 'foo bar',
        // 用onxxx开头的属性都视作事件
        onClick: () => {
        	// code
        }
    },
	children: [
        {
        	type: 'p',
            children: 'hello'
        },
        // 描述注释节点和text文本节点
        {
        	type: Text,
            // 在patch函数中挂载或更新节点时，如果是Text类型则会调用createTextNode函数创建节点
            children: '我是文本内容'
        },
        {
        	type: Comment,
          	// 如果类型是Comment，则会调用createComment来创建注释节点元素
            children: '我是注释内容‘
        },
        // vnode如何描述Fragment多根节点模板?
        {
        	type: Fragment,
            children: [
                { type: 'li', children: 'text1' },
                { type: 'li', children: 'text2' },
            ]
        },
        // 用key来作为vnode的标识
        { type:'p', children: '1', key: 1},
        { type:'p', children: '1', key: 2},
    ]
}
```

**要点2：理解HTML Attributes 与 DOM Properties**

> HTML Attributes：定义在HTML标签上的属性，如 id = "my-input"、type="text"。当浏览器解析这段代码后，会创建一个与之相符合的DOM元素对象，我们可以通过Javascript代码来读取该DOM对象：`const el = document.querySelector('#my-input')`,这个DOM对象会包含很多属性(properties)和很多的HTML Attributes一一对应，但是他们的名字可能并不相同，如class="my-input" 和 `el.className`。  
> 因此它俩的关系的核心原则：`HTML Atrributes`的作用是设置与之对应的DOM Properties的初始值


**patch(n1, n2, container)函数**：

1. 挂载操作：当n1节点不存在时则意味着没有旧的`vnode`，只需要执行`mountElement`

   1. 让`vnode.el`引用真实DOM元素:`const el = vnode.el = createElement(vnode.type)`,这一步将`vnode`和真实DOM元素建立联系，是为了之后的卸载操作更严谨。

   2. 判断节点类型是否是字符串string类型，是的话设置成文本内容；还要判断如果子节点有很多个则children是一个数组，如果是数组，我们需要遍历每一个子节点并调用patch函数挂载它。

   3. 挂载节点时，传递给`patch`函数的第一个参数是null，第三个参数是挂载点，需要判断`vnode.props`是否有属性，有的话则需要通过`setAttribute`将属性设置到元素上，也可以通过直接将属性设置到DOM对象上：`el[key] = vnode.props[key]`。这里因为HTML Attributes 与 DOM Properties的关系复杂，因此处理的时候需要保证代码的行为符合预期我们需要根据被设置属性的特点做出更具体的判断逻辑。有了这些判断我们只需要递归调用patch函数就可以完成挂载。这个**设置属性（包括class、绑定事件）的过程也会将其操作封装到`patchProps函数`中，来让其属性的设置步骤也变成与平台无关。**

      > 补充：`normalizeClass`函数:用于处理复杂的class属性的方法，本质是一个数据结构转换的小算法。**三种设置属性class的方法性能对比：`el.className`性能最优，`el.classList`其次，`setAttribute`第三。**
      > 在处理事件冒泡和更新时间时还需要用到做一个操作：**屏蔽所有绑定时间晚于事件触发时间的事件处理函数的执行，否则会有奇怪的现象。而这里在关于时间的存储和比较方面，使用的是高精时间：即`perfomance.now`**

2. 更新操作**`patch(n1, n2, container)`**

   1. 对比n1和n2所描述的内容相同，如两个不同的元素`p`元素和`input`元素不存在打补丁，即如果`vnode.type`属性不同正确的更新操作：先将p元素卸载(`unmount`)，再将input元素挂载到容器中。根据`type`是字符串还是对象去判断时普通标签还是对组件来执行挂载和打补丁。
   2. 对比并更新其子节点(`patchChildren函数`)：对一个元素打补丁的最后一步。首先要检查子节点类型，分为三种情况：没有子节点、文本子节点、一组子节点。如果说新旧两组节点都是一组子节点，那么将会涉及到Diff算法。
   3. **Diff算法：**为了以最小性能开销比较两组子节点完成更新操作的算法；
      **问题1：为什么我们需要引入key在作为`vnode`的标识？**:在对比新旧节点当我们需要通过移动DOM的方式来完成更新DOM时，因为节点的`vnode.type`属性值都是相同的，这导致我们无法确定新旧节点的对应关系，只有引入了`key`来作为`vnode`的标识，我们才知道怎样移动DOM来更新。`key`属性就是`vnode`的身份证号，如果两个节点的`type`和`key`都相同则认为他们是相同的可以进行复用。
      **简单Diff算法的核心逻辑：**拿新的一组子节点去旧的一组子节点中寻找可复用的节点。如果找到了则记录该节点的位置索引。我们把这个位置索引称为最大索引。在整个更新过程中，如果一个节点的索引值小于最大索引，则说明该节点对应的真实DOM元素需要移动。
      **双端Diff算法：**顾名思义，它是一种同时对新旧两组子节点的两个端点进行比较的算法。需要四个索引值指向两组子节点的端点。它的优势在于相比简单Diff算法，对于同样的更新场景下，执行的DOM移动操作次数会更少。
      **快速Diff算法：**借鉴了ivi和inferno框架的快速Diff算法，它的性能也优于Vue2的双端Diff算法。它对比前两种Diff算法还包含了预处理步骤(借鉴了纯文本的Diff算法的预处理步骤)：先处理新旧两组子节点中相同的前置节点和后置节点。当前置节点和后置节点都处理完毕后，如果无法简单的通过挂载新节点或者卸载节点来完成更新。则需要根据节点的索引关系，构造出一个最长递增子序列，这个最长递增子序列所指向的节点即为不需要移动的节点。

3. 卸载操作：发生在更新阶段：指当初次挂载完成后，后续渲染会触发更新。后续渲染时如果传递了null作为新`vnode`参数，则意味着不需要渲染，这时候我们需要卸载之前的内容。**根据虚拟节点对象`vnode.el`获取到真实DOM，将其从父元素中移除即可**，这些操作封装到了`unmount(vnode)`函数中了。
   **问题：为什么不用`innerHTML`直接完成卸载操作？**因为容器的内容可能是由某个或者多个组件渲染，卸载时应该正确调用这些组件的声明周期`unmounted`等函数；然后是存在自定义指令的元素我们也需要正确调用其指令的钩子函数；再是我们通过`innerHTML`移除的元素它不会移除绑定在DOM元素上的事件处理函数。