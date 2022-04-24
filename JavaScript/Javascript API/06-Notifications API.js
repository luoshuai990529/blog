/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-24 16:52:51
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-24 17:16:54
 */

/* 
    Notifications API 用于向用户显示通知。无论从哪个角度看，这里的通知都很类似 alert()对话框：
        都使用 JavaScript API 触发页面外部的浏览器行为，而且都允许页面处理用户与对话框或通知弹层的交互。
        不过，通知提供更灵活的自定义能力。
    Notifications API 在 Service Worker 中非常有用。
    渐进 Web 应用（PWA，Progressive Web Application）通过触发通知可以在页面不活跃时向用户显示消息，看起来就像原生应用。
*/

/* 
    通知权限：
        Notifications API 有被滥用的可能，因此默认会开启两项安全措施。
            1.通知只能在运行在安全上下文的代码中被触发；
            2.通知必须按照每个源的原则明确得到用户允许。
        用户授权显示通知是通过浏览器内部的一个对话框完成的。除非用户没有明确给出允许或拒绝的答复，否则这个权限请求对每个域只会出现一次。浏览器会记住用户的选择，如果被拒绝则无法重来。
        页面可以使用全局对象 Notification 向用户请求通知权限。
        这个对象有一个 requestPemission()方法，该方法返回一个期约（Promise），用户在授权对话框上执行操作后这个期约会解决(resolve)。
            Notification.requestPermission().then((permission) => { 
                console.log('User responded to permission request:', permission); 
            });
            "granted"值意味着用户明确授权了显示通知的权限。除此之外的其他值意味着显示通知会静默失败。
            一旦拒绝，就无法通过编程方式挽回，因为不可能再触发授权提示。

*/
// Notification.requestPermission().then((permission) => {
//     console.log('User responded to permission request:', permission);
// });

/* 
    显示和隐藏通知：
        Notification 构造函数用于创建和显示通知。
        最简单的通知形式是只显示一个标题，这个标题内容可以作为第一个参数传给 Notification 构造函数。
            new Notification('Title text!');
        调用这个构造函数返回的 Notification 对象的 close()方法可以关闭显示的通知。
        const n = new Notification('I will close in 1000ms'); 
        setTimeout(() => n.close(), 1000);
*/
// const n = new Notification('I will close in 1000ms');
// setTimeout(() => n.close(), 1000);

/* 
    通知生命周期回调：
        onshow 在通知显示时触发；
        onclick 在通知被点击时触发；
        onclose 在通知消失或通过 close()关闭时触发；
        onerror 在发生错误阻止通知显示时触发。
    例：
        const n = new Notification('foo'); 
        n.onshow = () => console.log('Notification was shown!'); 
        n.onclick = () => console.log('Notification was clicked!'); 
        n.onclose = () => console.log('Notification was closed!'); 
        n.onerror = () => console.log('Notification experienced an error!');
*/


