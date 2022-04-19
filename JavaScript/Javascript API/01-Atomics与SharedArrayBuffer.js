/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-16 20:05:52
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-19 17:44:59
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
    SharedArrayBuffer
        SharedArrayBuffer和 ArrayBuffer具有相同的API。
        二者的主要区别是ArrayBuffer必须在不同执行上下文间切换，SharedArrayBuffer则可以被任意多个执行上下文同时使用。
        在多个执行山西该文间共享内存意味着并发线程操作成为了可能。
        传统JavaScript操作对于并发内存访问导致的资源争用没有提供保护。
        多个工作者线程访问同一个SharedArrayBuffer就会导致资源争用问题。
        （为了解决这个问题，Atomics API应用而生。Atomics API可以保证SharedArrayBuffer上的JavaScript操作线程是安全的）

        注：SharedArrayBuffer API 等同于ArrayBuffer API。
*/

/* 

    Atomics与SharedArrayBuffer：
        多个上下文访问SharedArrayBuffer时，如果同时对缓冲区执行操作，就可能出现资源争抢问题。
        Atomics API（ES2017）通过强制同一时刻只能对缓冲区执行一个操作，可以让多个上下文安全的读写一个SharedArrayBuffer
        因为Atomics API像一个简化版的指令集架构，而原子操作的本质会排斥操作系统或计算机的自动执行的优化。如果应用不当就会导致程序执行变慢。
        所以Atomics API的设计初中是在最少但稳定的原子行为基础上，构建复杂的多线程Javascript程序。

        缘由：浏览器的JavaScript编译器和CPU架构本身都有权限重排指令以提升程序执行效率。正常情况下的JavaScript单线程环境是可以随时进行这种优化的，
        但是在多线程的指令重排可能会导致资源的争用，而且极难排错。
        
        Atomics API通过两种主要方式解决了上述问题：
            1.所有原子指令相互之间的顺序永远不会重排。
            2.使用原子读或原子写保证所有指令（原子和非原子指令）都不会对原子读/写重新排序。
                (这意味着位于原子读/写之前的所有指令会在原子读/写发生前完成，而位于原子读/写之后的所有指令会在原子读/写完成后才会开始。)

            Atomics的算术和位操作方法(读写缓冲区的值)：
                // 1.创建大小为1的缓冲区
                let sharedArrayBuffer = new SharedArrayBuffer(1);
                // 2.基于缓冲创建 Uint8Array
                let typedArray = new Uint8Array(sharedArrayBuffer);
                // 3.所有 ArrayBuffer 全部初始化为 0
                console.log(typedArray); // Uint8Array[0]

                Atomics.add(typeArray, 0, 5)：对索引 0 处的值执行原子加 5
                Atomics.sub(typeArray, 0, 5)：对索引 0 处的值执行原子减 5
                Atomics.or(typedArray, 0, 0b1111)：对索引 0 处的值执行原子或 0b1111
                Atomics.and(typedArray, 0, 0b1100)：对索引 0 处的值执行原子与 0b1111
                ....
            
            补充1：除了读写缓冲区的值，Atomics.load()和Atomics.store()还可以构建“代码围栏”（JavaScript引擎保证非原子指令可以相对于 load()或 store()本地重排，但这个重排不会侵犯原子读/写的边界。）
            补充2：为了保证连续、不间断的先读后写，Atomics API还提供了 exchange() 和 compareExchange()。
            补充3：为了让多线程程序可以支持复杂需求，Atomics API还提供了 模仿 Linux Futex 方法，可以作为更复杂锁机制的基本组件
            补充4：Atomics API 还提供了 Atomics.isLockFree()方法，用在高性能算法中可以用来确定是否有必要获取锁
*/
