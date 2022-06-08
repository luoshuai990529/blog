# 动画与Canvas图形

毋庸置疑，canvas是HTML5中最受欢迎的新特性。这个元素会占据一块页面区域，让 JavaScript可以动态在上面绘制图片。canvas自身提供了一些API，但并非所有的浏览器都支持这些API，其中包括支持基础绘图能力的 2D 上下文和被称为 WebGL 的 3D 上下文。支持的浏览器的最新版本现在都支持 2D 上下文和 WebGL。

### 1.requestAnimationFrame

#### 1.1-概述

​    这个API告诉浏览器要执行动画了，于是浏览器可以通过最优方式确定重绘的时序。**window.requestAnimationFrame(callback) **接收一个参数 callback回调函数，这个回调函数会在下一次浏览器 **重绘** 之前执行。

​    一般计算机的显示器屏幕刷新率都是60HZ，意味着每秒要重绘60次。大多数浏览器都会限制重绘频率，使其不超出屏幕的刷新率，因为即使超出了刷新率，用户也感知不到。因此，实现平滑动画最佳的重绘间隔为1000ms/60，大约17毫秒。以这个速度重绘可以实现最平滑的动画，因为这已经是浏览器的极限了。如果同时运行多个动画，可能需要加以限流，以免17毫秒的重绘间隔过快，导致动画过早运行完。

​    虽然setInterval()的定时动画比setTimeout()实现循环效率高，但是它俩都不能保证时间的精度。因为第二个参数的延时只能保证何时会将代码添加到浏览器的任务队列，不能保证添加到队列就会立即运行。如果队列前面有其他任务，那么就要等到这些任务执行完再执行。

#### 1.2-时间间隔的问题

​    知道何时绘制下一帧是创造平滑动画的关键。直到几年前，都没有办法确切保证何时能让浏览器吧下一帧绘制出来。随着canvas流行和HTML5兴起，setInterval 和 setTimeout的不精确是个很大的问题。而浏览器自身计时器的精度让这个问题更雪上加霜。如Chrome的计时器精度为4ms，Firefox和Safari是10ms。

#### 1.3-使用requestAnimationFrame

​    requestAnimationFrame()方法接收一个参数，此参数是一个要在重绘屏幕前调用的函数。为了实现动画循环，可以把多个requestAnimationFrame()调用串联起来：

```javascript
var div = document.getElementById("status"); 
 div.style.width = (parseInt(div.style.width, 10) + 5) + "%"; 
 if (div.style.left != "100%") { 
   requestAnimationFrame(updateProgress); 
 } 
} 
requestAnimationFrame(updateProgress);
// 因为 requestAnimationFrame()只会调用一次传入的函数，所以每次更新用户界面时需要再手动调用它一次。同样，也需要控制动画何时停止。结果就会得到非常平滑的动画。
```

​    目前此API已经解决了浏览器不知道JS动画何时开始执行的问题，以及最佳间隔是多少的问题，但是不知道自己的代码何时实际执行的问题呢？解决方法：

​    传给requestAnimationFrame() 的回调函数上其实可以接收一个参数，此参数是一个**DOMHighRes - TimeStamp的实例( 如performance.now()返回的值 )**，表示下次重绘的时间。有了这个未来已知的时间点，告诉了我们开发者，那么基于这个参数，我们就可以更好的对动画进行调优了。

​    和定时器类似，requestAnimationFrame也返回一个请求ID，可以用于**cancelAnimationFrame()**来取消重绘任务。

#### 1.4-使用requestAnimationFrame节流

通过 requestAnimationFrame()递归地向队列中加入回调函数，可以保证每次重绘最多只调用一次回调函数。这是一个非常好的节流工具。在频繁执行影响页面外观的代码时（比如滚动事件监听器），可以利用这个回调队列进行节流。

```javascript
// 例：如果想把时间处理程序的调用限制在每次重绘前发送，我们可以把它用requestAnimationFrame进行一个封装
window.addEventListener('scroll', () => { 
 window.requestAnimationFrame(expensiveOperation);
});
// 这样会把所有回调的执行集中在重绘钩子，但不会过滤掉每次重绘的多余调用。我们可以通过一个开关状态变量，来将多余的调用屏蔽
let enqueued = false; 
function expensiveOperation() { 
 console.log('Invoked at', Date.now()); 
 enqueued = false; 
} 
window.addEventListener('scroll', () => { 
 if (!enqueued) { 
   enqueued = true; 
   window.requestAnimationFrame(expensiveOperation); 
 } 
});

// 补充：因为重绘是非常频繁的操作，所以这里可能算不上真正的节流。更好的办法是配合一个计时器来限制执行的评率。计时器可以限制实际操作的执行间隔，而requestAnimationFrame控制在浏览器的哪个渲染周期中执行。
let enabled = true; 
function expensiveOperation() { 
 console.log('Invoked at', Date.now()); 
} 
window.addEventListener('scroll', () => { 
 if (enabled) { 
   enabled = false; 
   window.requestAnimationFrame(expensiveOperation); 
   window.setTimeout(() => enabled = true, 50); 
 } 
});
```

### 2.Canvas

​    创建<canvas>元素时至少要设置其 width 和 height 属性，这样才能告诉浏览器在多大的面积上绘图。canvas开始和结束标签之间的内容用于，当浏览器不支持canvas元素时展示：`<canvas id="drawing" width="200" height="200">A drawing of something.</canvas>`

基本使用请见canvas文件下的代码示例

### 3.WebGL

**概述**：**WebGL 是画布的 3D 上下文**。与其他 Web 技术不同，WebGL 不是 W3C 制定的标准，而是 Khronos Group 的标准。“Khronos Group 是非营利性、会员资助的联盟，专注于多平台和设备下并行计算、图形和动态媒体的无专利费开放标准”。——官网描述。Khronos Group 也制定了其他图形 API，包括作为浏览器中 WebGL 基础的 OpenGL ES 2.0。

**OpenGL和WebGL的区别**：

- WebGL
  - WebGL 是基于 [OpenGL](https://so.csdn.net/so/search?q=OpenGL&spm=1001.2101.3001.7020) ES 2.0 的 Javascript API，而不是纯OpenGL(ES代表“嵌入式系统”)
  - WebGL通过 [HTML5](https://so.csdn.net/so/search?q=HTML5&spm=1001.2101.3001.7020) 的 Canvas 来和 DOM 打交道。因此也和 OpenGL ES 2.0 一样，使用 GLSL 作为 Shading Language （一种 C-Like 顶点计算和着色的语言，缓存编译到 GPU，由 GPU 来执行）。
  - WebGL 2.0基于OpenGL ES 3.0，确保了提供许多选择性的WebGL 1.0扩展，并引入新的[API](https://so.csdn.net/so/search?q=API&spm=1001.2101.3001.7020)
- OpenGL
  - OpenGL ES本质上是OpenGL的一个子集。
  - OpenGL_ES是khronos协会从OpenGL裁剪定制而来的，专为手机，游戏机等[嵌入式](https://so.csdn.net/so/search?q=%E5%B5%8C%E5%85%A5%E5%BC%8F&spm=1001.2101.3001.7020)设备而设计。它的接口其实和 Open GL很类似。
  - OpenGL ES相对OpenGL删减了一切低效能的操作方式，有高性能的决不留低效能的，即只求效能不求兼容性。

**小结 **：WebGL主要用于浏览器。OpenGL确实需要本机驱动程序，并且主要用于安装软件。WebGL基于OpenGL ES，但它缺少常规OpenGL具有的许多功能。WebGL更易于学习和开发应用程序。如果您熟悉WebGL，则可以轻松学习OpenGL。这里不涉及过多OpenGL概念。







































