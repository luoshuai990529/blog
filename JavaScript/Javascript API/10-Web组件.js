/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-27 20:19:35
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-28 20:53:16
 */
/* 
    问题：离开Vue、React、Angular，你怎么实现组件化？

    概述：Web Components 是一套不同的技术，允许您创建可重用的定制元素（它们的功能封装在您的代码之外）并且在您的web应用中使用它们。

    Web Components 就是为了解决 自定义复杂的HTML以及相关的样式和脚本，有时候不得不写代码来呈现自定义UI空间，一旦不小心则页面会变得非常糟糕。
    特征：
        1.非侵入（能很好的组织好自身的HTML结构、CSS样式、JS代码，而且不会干扰到页面中的其他代码）
        2.标准化（主流浏览器支持，属于W3C Web标准）
        3.无依赖，开箱即用（不需要引入第三方的库或框架的情况下通过浏览器的API创建可复用的组件，也可以和任意与HTML交互的JS库和框架搭配使用）
        4.纯原生（技术栈无关，他是浏览器的原生组件，所以可以再任何框架中使用）
    应用场景：
        组件库、跨端、微前端
    Web Components由三项主要技术组成：
        1.Custom elements（自定义元素）：一组JavaScript API，允许您定义custom elements及其行为，然后可以在您的用户界面中按照需要使用它们。
        2.Shadow DOM（影子DOM）：一组JavaScript API，用于将封装的“影子”DOM树附加到元素（与主文档DOM分开呈现）并控制其关联的功能。
          通过这种方式，您可以保持元素的功能私有，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突。
        3.HTML templates（HTML模板）：<template> 和 <slot> 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。
        
        上述这一套浏览器的API特别混乱，因为没有统一的 Web Components 规范，以及有些Web组件如银子DOM的不兼容问题，还有浏览器的实现不一致。
        因为这些问题，因此使用Web组件通常需要引入一个Web组件库，如Polymer，模拟浏览器缺失的Web组件。

    简短的理解上述三项技术
        Custom elements：使用 customElements.define 声明自定义标签
        Shadow DOM：将自定义组件 和 外界 的 dom 和 样式隔离
        HTML templates：用 HTML 的方式定义模版

    拓展：
        国内已有实践Web Components的是Taro v3版本
        跨端：一套Web Components组件既可以泡在Web上 也可以跑在小程序上。
        Taro 3.x 的基本原理是在Taro runtime提供了一套模拟 DOM & BOM 的 API，React&Vue 最终调用的API会被映射到Taro runtime 模拟的那一套API，然后 Taro runtime在模拟的API内部做微信小程序相关组件和API的调用。
        国内腾讯开源的omi-mp也实现了跨端：https://github.com/Tencent/omi/blob/master/README.CN.md

    相关文章和参考学习：
        哈啰前端Web Components最佳实践：https://juejin.cn/post/7044055764532461605#heading-0
        从0到1上手Web Components开发：https://juejin.cn/post/7044899239876362253
        《JavaScript高级程序设计4》的 Web组件 小节
    
*/  