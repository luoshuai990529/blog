# LRU(Least Recently Used: 最近最少使用)算法

### 1.概述

LRU是Least Recently Used的缩写，即最近最少使用，是一种常用的[页面置换算法](https://baike.baidu.com/item/%E9%A1%B5%E9%9D%A2%E7%BD%AE%E6%8D%A2%E7%AE%97%E6%B3%95/7626091)，选择最近最久未使用的页面予以淘汰。如浏览器的缓存淘汰策略，核心思想：**如果数据最近被访问过，那么将来被访问的几率也更高**，优先淘汰最近没有被访问到的数据。



### 2.浏览器的LRU缓存淘汰策略

例：当我们首次访问一个网页时，打开很慢，但当我们再次打开这个网页时，打开就很快。

这里就涉及了缓存在浏览器上的应用：浏览器缓存。当我们访问一个网页时，它会在发起真正的网络请求前，查询浏览器缓存，看是否有要请求的文件，如果有，浏览器将会拦截请求，返回缓存文件，并直接结束请求，不会再去服务器上下载。不过不存在，才会去服务器请求。当浏览器缓存在本地的空间用满，此时，如果继续进行网络请求就需要确定缓存中哪些数据被保留，哪些数据被移除，这就是**浏览器缓存淘汰策略**，最常见的有：**FIFO(先进先出)、LFU(最少使用)、LRU(最近最少使用)**。



### 3.Vue的keep-alive中LRU的实现

keep-alive 在 vue 中用于实现组件的缓存，当组件切换时不会对当前组件进行卸载。通过 `include`、`exculde`可以对组件进行有条件的缓存。在2.5版本中，keep-alive又新增了**max **属性，可以限制最多缓存多少组件实例，一旦达到这个限制，在新实例被创建之前，已缓存组件中最久没有被访问到的实例就会被销毁掉，这里就应用到了**LRU算法** 。



**实现LRU的数据结构**：经典的LRU一般都是用**hashMap + 双向链表** 。考虑可能需要频繁删除一个元素，并将这个元素的前一个节点指向下一个节点，所以使用**双链接**最合适。并且它是按照结点最近被使用的时间顺序来存储的。如果一个节点被访问了，我们有理由相信它在接下来的一段时间被访问的概率要大于其他节点的。

#### 代码实现：./LRU.js

**Vue 中的Keep-Alive**:

原理：

1. 使用LRU缓存机制进行缓存，max 限制缓存表的最大容量
2. 根据设定的 include/exclude（如果有）进行条件匹配,决定是否缓存。不匹配,直接返回组件实例
3. 根据组件 ID 和 tag 生成缓存 Key ,并在缓存对象中查找是否已缓存过该组件实例。如果存在,直接取出缓存值并更新该 key 在 this.keys 中的位置(更新 key 的位置是实现 LRU 置换策略的关键)
4. 获取节点名称，或者根据节点 cid 等信息拼出当前 组件名称
5. 获取 keep-alive 包裹着的第一个子组件对象及其组件名

源码分析：

```javascript

// 1.初始化 keep-alive 组件
const KeepAliveImpl: ComponentOptions = {
  name: `KeepAlive`,
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number],
  },
  setup(props: KeepAliveProps, { slots }: SetupContext) {
    // 初始化数据
    // code...
    // 当 props 上的 include 或者 exclude 变化时移除缓存
    watch(
      () => [props.include, props.exclude],
      ([include, exclude]) => {
      include && pruneCache((name) => matches(include, name));
      exclude && pruneCache((name) => !matches(exclude, name));
      },
      { flush: "post", deep: true }
    );
    // 缓存组件的子树 subTree
    // code...
    // KeepAlive 组件的设计，本质上就是空间换时间。
    // 在 KeepAlive 组件内部，当组件渲染挂载和更新前都会缓存组件的渲染子树 subTree
    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);
    onBeforeUnmount(() => {
    // 卸载缓存表里的所有组件和其中的子树...
    }
    return ()=>{
      // 返回 keepAlive 实例
    }
  }
}

return ()=>{
  // 省略部分代码，以下是缓存逻辑 code...
  // key 值是 KeepAlive 子节点创建时添加的，作为缓存节点的唯一标识
  const key = vnode.key == null ? comp : vnode.key
  // 通过 key 值获取缓存节点
  const cachedVNode = cache.get(key)
  if (cachedVNode) {
    // 缓存存在，则使用缓存装载数据 code...
  } else {
    // 属性配置 max 值，删除最久不用的 key ，这很符合 LRU 的思想 code...
  }
    // 避免 vNode 被卸载
    vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
    current = vnode
    return vnode;
}

// 2.将组件移出缓存表

// 遍历缓存表
function pruneCache(filter?: (name: string) => boolean) {
    // code...
    pruneCacheEntry(key)
}
// 依据 key 值从缓存表中移除对应组件
function pruneCacheEntry(key: CacheKey) {
	if(){
    	// 当前没有处在 activated 状态的组件，或者当前处在 activated 组件不是要删除的 key 时
        // 卸载这个组件 
        unmount(cached); // unmount方法里同样包含了 resetShapeFlag
    }else{
    	// 当前组件在未来应该不再被 keepAlive 缓存,虽然仍在 keepAlive 的容量中但是需要刷新当前组件的优先级
        resetShapeFlag(current);
    }
}
function resetShapeFlag(vnode: VNode) {
  let shapeFlag = vnode.shapeFlag; // shapeFlag 是 VNode 的标识
   // ... 清除组件的 shapeFlag
}
```

#### 小结：

 Vue 内部将 DOM 节点抽象成了一个个的 VNode 节点，keep-alive 组件的缓存也是基于 VNode 节点的而不是直接存储 DOM 结构。它将满足条件（ include 与 exclude ）的组件在 cache 对象中缓存起来，在需要重新渲染的时候再将 vnode 节点从 cache 对象中取出并渲染。

具体缓存过程如下：

1. 声明有序集合 keys 作为缓存容器，存入组件的唯一 key 值
2. 在缓存容器 keys 中，越靠前的 key 值意味着被访问的越少也越优先被淘汰
3. 渲染函数执行时，若命中缓存时，则从 keys 中删除当前命中的 key，并往 keys 末尾追加 key 值，刷新该 key 的优先级
4. 未命中缓存时，则 keys 追加缓存数据 key 值，若此时缓存数据长度大于 max 最大值，则删除最旧的数据
5. 当触发 beforeMount/update 生命周期，缓存当前 activated 组件的子树的数据











































