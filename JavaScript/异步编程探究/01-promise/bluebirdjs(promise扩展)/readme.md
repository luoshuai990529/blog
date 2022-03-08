# bluebird

### 介绍：

**Bluebird是一个专注于创新和性能并且功能齐全的Promise库, 它可以在各种浏览器上运行包括一些旧版本的浏览器。**

- [github地址]([petkaantonov/bluebird: Bluebird is a full featured promise library with unmatched performance. (github.com)](https://github.com/petkaantonov/bluebird))
- [官方文档]([Getting Started | bluebird (bluebirdjs.com)](http://bluebirdjs.com/docs/getting-started.html))

### 注意：

**如果可以的话请优先考虑使用原生的Promise**， 因为现在的原生promise在node.js 和 绝大多数浏览器的版本中已经非常稳定了，而bluebird仍然提供一些实用的方法，可以使用它但是还是要优先考虑原生promise。

目前-如果你需要支持旧版本的浏览器或者Eol Node.js, 或者作为一个中间步骤使用 警告/监控 来发现bug，建议使用bluebird。



ps: 以上都是bluebird的官方原话哈，都是用谷歌翻译把英文翻译过来的，如果可以建议自己去看一下文档，如官方所说其实我也是借助bluebird这个库来深入了解和学习一下promise，在实际开发中其实原生promise 已经有很好的支持了。这里也例举了bluebird库中的几个api来了解。

再补充一篇百度到的文章：[promise 进阶 —— async / await 结合 bluebird - 小蒋不素小蒋 - 博客园 (cnblogs.com)](https://www.cnblogs.com/xjnotxj/p/12041074.html)