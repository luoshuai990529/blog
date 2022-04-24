/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-24 17:17:31
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-24 17:29:14
 */

/* 
    Web 开发中一个常见的问题是开发者不知道用户什么时候真正在使用页面。
    如果页面被最小化或隐藏在其他标签页后面，那么轮询服务器或更新动画等功能可能就没有必要了。
    Page Visibility API 旨在为开发者提供页面对用户是否可见的信息。

    这个API由3部分构成：
        document.visibilityState值，表示下面4种状态之一：
            1.页面在后台标签页或浏览器中最小化了。
            2.页面在前台标签页中。
            3.实际页面隐藏了，但对页面的预览是可见的
            4.页面在屏外预渲染。
        visibilitychange事件，该事件会在文档从隐藏变可见(或反之)时触发。
        document.hidden 布尔值，表示页面是否隐藏。这可能意味着页面在后台标签页或浏览器中被最小化了。(应优先使用document.visibilityState检测页面可见性)
        document.visibilityState 的值是以下三个字符串之一："hidden" "visible" "prerender"

*/

document.addEventListener('visibilitychange', ()=>{
    console.log("visibilitychange-", document.visibilityState);
})




