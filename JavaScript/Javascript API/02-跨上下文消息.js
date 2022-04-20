/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-19 17:45:56
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-20 21:38:09
 */

/* 
    跨上下文消息（XDM - cross-document messaging），是一种在不同执行上下文(工作线程或者不同源页面)间传递信息的能力
       
    注意：跨上下文消息用于窗口之间通信或者工作线程之间通信。这里主要了解postMessage()与其他窗口通信。

     postMessage()方法接收3个参数：
        param1:消息
        param2:表示目标接收源的字符串和可选的可传输对象的数组(只与工作线程相关),这个参数对于安全非常重要，它可以限制浏览器交付数据的目标

    例：
        let iframeWindow = document.getElementById('myframe').contentWindow;
        iframeWindow.postMessage("message test", "http://www.lewis.com"); // 这里第二个参数限制指定了源必须是http://www.lewis.com

        接收到消息后，window对象上会触发message事件。这个事件是异步触发的，因此从发出到接收消息可能会有延迟。

        传给onmessage事件处理程序的event对象包含以下3方面重要信息：
            data：作为第一个参数传递给postMessage()的字符串数据。
            origin：发送消息的文档源，如"http://www.wrox.com"
            source：发送消息的文档中window对象的代理。这个代理对象主要用于在发送上一条消息的窗口执行postMessage()方法。
            如果发送窗口有相同的源，那么这个对象应该就是window对象。

        接收消息之后验证窗口的源非常重要。和postMessage的第二个参数可以保证数据不会意外传给未知页面。
            基本使用：
                window.addEventListner("message", (event) => {
                    if(event.origin === "http://www.lewis.com"){
                        // code...
                        console.log(event.data)
                        // 向来源窗口发送一条消息
                        event.source.postMessage("recived!", "http://xxxx")
                    }
                })

    小结：
        在通过内嵌窗格加载不同域时，使用 XDM 是非常方便的。这种方法在混搭（mashup）和社交应用
    中非常常用。通过使用 XDM 与内嵌窗格中的网页通信，可以保证包含页面的安全。XDM 也可以用于
    同源页面之间通信。
    
*/