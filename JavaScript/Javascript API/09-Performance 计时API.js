/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-25 10:07:10
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-26 20:48:53
 */

/* 
    Performance 接口通过 JavaScript API 暴露了浏览器内部的度量指标，可以获取到当前页面中与性能相关的信息,
    允许开发者直接访问这些信息并基于这些信息实现自己想要的功能。
    它由多个API构成：
        High Resolution Time API 
        Performance Timeline API 
        Navigation Timing API 
        User Timing API 
        Resource Timing API 
        Paint Timing API
*/

// High Resolution Time API
// function foo() { }
// const t0 = Date.now()
// foo()
// const t1 = Date.now()
// console.log(t1 - t0); // 打印：0 解释：Date.now()只有毫秒级精度，如果 foo()执行足够快，则两个时间戳的值会相等。

/* 
    High Resolution Time API 定义了 window.performance.now()，
    这个方法返回一个微秒精度的浮点值，可以精确的度量时间的流逝
*/
console.log("------High Resolution Time API------");
// function foo() { }
// const time0 = performance.now();
// foo()
// const time1 = performance.now();

// console.log(time0); // 107.80000001192093
// console.log(time1); // 108
// console.log(time1 - time0); // 0.19999998807907104

// 因为在不同上下文初始化时可能存在时间差如新的工作者线程，因此没有共享参照点就不能直接比较performance.now()。
// 而可以用到：performance.timeOrigin 属性返回计时器初始化时全局系统时钟的值。
// const relativeTimestamp = performance.now(); 
// const absoluteTimestamp = performance.timeOrigin + relativeTimestamp; 
// console.log(relativeTimestamp); // 111.89999997615814
// console.log(absoluteTimestamp); // 1650976317267.7

/* 
    Performance Timeline API 使用一套用于度量客户端延迟的工具扩展了 Performance 接口。
    性能度量将会采用计算结束与开始时间差的形式。

    在一个执行上下文中被记录的所有性能条目可以通过 performance.getEntries()获取：
    console.log(performance.getEntries()); // [PerformanceNavigationTiming, PerformanceResourceTiming, ... ]
    
    这个返回的集合代表浏览器的 性能时间线（performance timeline）
*/
console.log("------Performance Timeline API 获取被记录的性能条目------");
// const entry = performance.getEntries()[0];
// console.log(entry.name); // "http://127.0.0.1:5501/JavaScript/Javascript%20API/index.html" 
// console.log(entry.entryType); // navigation 
// console.log(entry.startTime); // 0 
// console.log(entry.duration); // 182.36500001512468

/* 
    User Timing API 用于记录和分析自定义性能条目。

    记录自定义性能条目要使用：performance.mark()方法
*/
console.log("------User Timing API------");
performance.mark('lewis');
console.log("分析自定义性能条目:", performance.getEntriesByType('mark')[0]);
// PerformanceMark {
//    detail: null
//    duration: 0
//    entryType: "mark"
//    name: "lewis"
//    startTime: 98.5
// }



/* 
    Navigation Timing API 提供了高精度时间戳，用于度量当前页面加载速度。
    浏览器会在导航事件发生时自动记录 PerformanceNavigationTiming 条目。
    这个对象会捕获大量时间戳，用于描述页面是何时以及如何加载的。
*/
console.log("------Navigation Timing API------");
const [performanceNavigationTimingEntry] = performance.getEntriesByType('navigation');
console.log(performanceNavigationTimingEntry);
// PerformanceNavigationTiming{
//     connectEnd: 4.299999982118607
//     connectStart: 4.299999982118607
//     decodedBodySize: 2787
//     domComplete: 116.7999999821186
//     domContentLoadedEventEnd: 111
//     loadEventEnd: 116.90000000596046
//     loadEventStart: 116.90000000596046
//     ...
// }
// 计算 loadEventStart 和 loadEventEnd 时间戳之间的差
console.log("loadEventStart 和 loadEventEnd 时间戳之间的差: ", performanceNavigationTimingEntry.loadEventEnd - performanceNavigationTimingEntry.loadEventStart);

/* 
    Resource Timing API 提供了高精度时间戳，用于度量当前页面加载时请求资源的速度。
    浏览器会在加载资源时自动记录 PerformanceResourceTiming。这个对象会捕获大量时间戳，用于描述资源加载的速度。
    通过计算并分析不同时间的差，可以更全面地审视浏览器加载页面的过程，发现可能存在的性能瓶颈。
*/
console.log("------Resource Timing API 度量当前页面加载时请求资源的速度------");
const performanceResourceTimingEntry = performance.getEntriesByType('resource')[0];
console.log("performanceResourceTimingEntry:", performanceResourceTimingEntry);
// 计算加载一个特定资源所花的时间
console.log(performanceResourceTimingEntry.responseEnd - performanceResourceTimingEntry.requestStart);// 2.5







