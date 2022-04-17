/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-16 20:05:52
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-17 22:14:04
 */

/* 
    前置补充：
        ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区。
            它是一个字节数组，不能直接操作ArrayBuffer的内容，而是要通过类型数组对象(TypedArray)或DataView对象来操作，他们会将缓冲区中的数据表示为特定格式，并通过这些格式来读写缓冲区的内容。
                DataView：是一个可以从 二进制ArrayBuffer 对象中读写多种数值类型的底层接口，使用它时，不用考虑不同平台的字节序问题。
                    DataView视图用来读写复杂类型的二进制数据
                TypedArray：描述了一个底层的二进制数据缓冲区的一个类数组视图。（TypedArray 指的是：Int8Array()、Uint8Array()、Uint8ClampedArray()、Int16Array()、Uint16Array()....其中之一）。
                    TypedArray用来读写简单类型的二进制数据
            简述：ArrayBuffer对象是JS操作二进制数据的一个接口，它允许开发者以数组下标的形式直接操作内存，增强了JS处理二进制数据的能力。
        
            ArrayBuffer的一些API：
                isView()静态方法:返回一个布尔值，表示参数是否为ArrayBuffer的视图实例
                slice()实例方法:允许将内存区域的一部分，拷贝生成一个新的ArrayBuffer对象
                byteLength实例属性:返回所分配的内存区域的字节长度。

*/

/* 
    

    Atomics与SharedArrayBuffer：
        多个上下文访问SharedArrayBuffer时，如果同时对缓冲区执行操作，就可能出现资源争抢问题。
        Atomics API（ES2017）通过强制同一时刻只能对缓冲区执行一个操作，可以让多个上下文安全的读写一个SharedArrayBuffer
        因为Atomics API像一个简化版的指令集架构，而原子操作的本质会排斥操作系统或计算机的自动执行的优化。如果应用不当就会导致程序执行变慢。
        所以Atomics API的设计初中是在最少但稳定的原子行为基础上，构建复杂的多线程Javascript程序
*/

/* 
    SharedArrayBuffer
        SharedArrayBuffer和 ArrayBuffer具有相同的API。
        二者的主要区别是ArrayBuffer必须在不同执行上下文间切换，SharedArrayBuffer则可以被任意多个执行上下文同时使用。
        在多个执行山西该文间共享内存意味着并发线程操作成为了可能。
        传统JavaScript操作对于并发内存访问导致的资源争用没有提供保护。
        多个工作者线程访问同一个SharedArrayBuffer就会导致资源争用问题。
        （为了解决这个问题，Atomics API应用而生。Atomics API可以保证SharedArrayBuffer上的JavaScript操作线程是安全的）

        注：SharedArrayBuffer API 等同于ArrayBuffer API。
*/