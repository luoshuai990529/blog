/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-24 17:29:38
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-24 18:38:44
 */

/* 
    Streams API 是为了解决一个简单又基础的问题而生：Web应用如何消费有序的小信息块而不是大块信息，这种能力主要有两种场景：
        1.大块数据可能不会一次性都可用。
            网络请求的响应就是一个典型的例子。网络负载是以连续信息包形式交付的，
            而流式处理可以让应用在数据一到达就能使用，而不必等到所有数据都加载完毕。
        2.大块数据可能需要分小部分处理。
            视频处理、数据压缩、图形编码和JSON解析都可以分为小部分进行处理，
            而不必等到所有数据都在内存中时再处理的例子。
    
    在网络请求和远程资源时会介绍Streams API在fetch()中的应用，不过 Streams API本身是通用的。
    实现 Observable 接口的 JavaScript 库共享了很多流的基础概念。
    注意：虽然 Fetch API已经得到所有主流浏览器支持，但 Streams API则没有那么快得到支持。
*/

/* 
    理解流：
        提到流，可以把数据想象成某种通过管道输送的液体。JavaScript中的流借用了管道相关的概念，
        因为原理是相通的。Streams API 直接解决的问题是 处理网络请求 和 读写磁盘。

        Streams API定义了三种流：
            可读流：可以通过某个公共接口读取数据块的流。数据在内部从底层源进入流，然后由消费者进行处理。
            可写流：可以通过某个公共接口写入数据块的流。生产者将数据写入流，数据在内部传入底层数据槽。
            转换流：由两种流组成，可写流用于接收数据，可读流用于输出数据。这两个流之间是转换程序（transformer），可以根据需要检查和修改流内容。
        
        流的基本单位是 块(chunk)。
                块可是任意数据类型，但通常是定型数组。每个块都是离散的流片段，可以作为一个整体来处理。
            更重要的是，块不是固定大小的，也不一定按固定间隔到达。
            在理想的流当中，块的大小通常近似相同，到达间隔也近似相等。
                流不平衡是场景的问题，但流也提供了解决这个问题的工具。所有流都会为已进入流但尚未离开流的块
                提供一个内部队列。当块 入列速度 快于 出列速度，则内部队列会不断增大。
                流不能让其内部队列无限增大，因此它会使用 反压 通知流入口停止发送数据，直到队列大小降到某个阈值以下。

 */


/* 
    可读流：
        可读流是对底层数据源的封装。底层数据源可以将数据填充到流中，允许消费者通过流的公共接口读取数据。
*/

// 把 5 个值加入了流的队列
// async function* ints() { 
//     // 每 1000 毫秒生成一个递增的整数
//     for (let i = 0; i < 5; ++i) { 
//         yield await new Promise((resolve) => setTimeout(resolve, 1000, i)); 
//     } 
// } 

// const readableStream = new ReadableStream({ 
//     async start(controller) { 
//         for await (let chunk of ints()) { 
//             controller.enqueue(chunk); 
//         } 
//         controller.close(); 
//     } 
// }); 
// console.log(readableStream.locked); // false 
// const readableStreamDefaultReader = readableStream.getReader(); 
// console.log(readableStream.locked); // true 

// // 消费者：消费者使用这个读取器实例的 read()方法可以读出值
// (async function() { 
//     while(true) { 
//         const { done, value } = await readableStreamDefaultReader.read(); 
//         if (done) { 
//             break; 
//         } else { 
//             console.log(value); 
//         } 
//     } 
// })(); 
// 0 
// 1 
// 2 
// 3 
// 4


/* 
    可写流：
        可写流是底层数据槽的封装。底层数据槽处理通过流的公共接口写入的数据。
*/

// async function* ints() {
//     // 每 1000 毫秒生成一个递增的整数
//     for (let i = 0; i < 5; ++i) {
//         yield await new Promise((resolve) => setTimeout(resolve, 1000, i));
//     }
// }

// const writableStream = new WritableStream({
//     write(value) {
//         console.log(value);
//     }
// });

// console.log(writableStream.locked); // false 
// const writableStreamDefaultWriter = writableStream.getWriter();
// console.log(writableStream.locked); // true 
// // 生产者
// (async function () {
//     for await (let chunk of ints()) {
//         await writableStreamDefaultWriter.ready;
//         writableStreamDefaultWriter.write(chunk);
//     }
//     writableStreamDefaultWriter.close();
// })();

/* 
    转换流：
        转换流用于组合可读流和可写流。数据块在两个流之间的转换是通过 transform()方法完成的。
*/
// async function* ints() {
//     // 每 1000 毫秒生成一个递增的整数
//     for (let i = 0; i < 5; ++i) {
//         yield await new Promise((resolve) => setTimeout(resolve, 1000, i));
//     }
// }
// const { writable, readable } = new TransformStream({
//     transform(chunk, controller) {
//         controller.enqueue(chunk * 2);
//     }
// });
// const readableStreamDefaultReader = readable.getReader();
// const writableStreamDefaultWriter = writable.getWriter();
// // 消费者
// (async function () {
//     while (true) {
//         const { done, value } = await readableStreamDefaultReader.read();
//         if (done) {
//             break;
//         } else {
//             console.log("消费者：", value);
//         }
//     }
// })();
// // 生产者
// (async function () {
//     for await (let chunk of ints()) {
//         await writableStreamDefaultWriter.ready;
//         console.log("生产者：", chunk);
//         writableStreamDefaultWriter.write(chunk);
//     }
//     writableStreamDefaultWriter.close();
// })();
// 生产者： 0
// 消费者： 0
// 生产者： 1
// 消费者： 2
// 生产者： 2
// 消费者： 4
// 生产者： 3
// 消费者： 6
// 生产者： 4
// 消费者： 8

/* 
    通过管道连接流:
        流可以通过管道连接成一串。最常见的用例是使用 pipeThrough() 方法把 ReadableStream 接入 TransformStream。
        从内部看，ReadableStream 先把自己的值传给 TransformStream 内部的 WritableStream，
        然后执行转换，接着转换后的值又在新的 ReadableStream 上出现。
*/
async function* ints() {
    // 每 1000 毫秒生成一个递增的整数
    for (let i = 0; i < 5; ++i) {
        yield await new Promise((resolve) => setTimeout(resolve, 1000, i));
    }
}
const integerStream = new ReadableStream({
    async start(controller) {
        for await (let chunk of ints()) {
            controller.enqueue(chunk);
        }
        controller.close();
    }
});
const doublingStream = new TransformStream({
    transform(chunk, controller) {
        controller.enqueue(chunk * 2);
    }
});
// 通过管道连接流
const pipedStream = integerStream.pipeThrough(doublingStream);
// 从连接流的输出获得读取器
const pipedStreamDefaultReader = pipedStream.getReader();
// 消费者
(async function () {
    while (true) {
        const { done, value } = await pipedStreamDefaultReader.read();
        if (done) {
            break;
        } else {
            console.log(value);
        }
    }
})();

