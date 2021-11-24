<!--
 * @Author: luoshuai
 * @Date: 2021-09-30 10:29:16
 * @LastEditTime: 2021-10-14 09:46:36
 * @LastEditors: Please set LastEditors
 * @Description: note
-->
# 《JavaScript 设计模式和实践》
# 1-前置(基础知识)：
### 1.1-多态在面向对象程序设计中的作用
*   多态的最根本好处在于，你不必再向对象询问“你是什么类型”而后根据得到的答案调用对象的某个行为，你只管调用该行为就是了，其他一切多态机制都会为你安排妥当--《重构：改善既有代码的设计》。
*   换句话说多态最根本的作用就是通过把过程化的条件分支语句转化为对象的多态性，从而消除这些条件分支语句。
    > 例：在电影拍摄现场，当导演喊出“action”时，主角开始背台词，灯光师负责灯光，道具师负责开始往镜头撒雪花。
    在得到同一个消息时，每个对象都知道自己应该做什么。如果不利用对象的多态性，而是用面向过程的方式来编写这一段代码
    那么相当于在电影开始拍摄之后，导演每次都要走到每个人面前确认他们的职业分工（类型），然后告诉他们要做什么。
    如果映射到程序中，那么程序中充斥着条件分支语句 

利用对象的多态性，导演在发布消息时，就不需要考虑各个对象街道消息后该做什么。对象应该做什么并不是临时决定的，而是已经事先约定和排练完毕的。每个对象应该做什么，已经成了该对象的一个方法，安装在对象的内部，每个对象负责他自己的行为。因此这些对象可以根据同一个消息，分别进行各自的工作。
# 设计模式：
  设计模式的主题总是把不变的事物和变化的事物分离开来
## 2-原型模式
*  2.1-JavaScript的面向对象系统就是通过原型模式来构建的，是JavaScript语言的根本。
*  2.2-JavaScript时通过克隆Object.prototype来得到新的对象，但实际上并不是每次都真正的克隆了一个新的对象。从内存的方面考虑出发，js还做了一些额外的处理，具体细节可以参阅《JavaScript语言精髓与编程实践》
*  2.3-设计模式在很多时候都体现了语言的不足之处，有人说过，设计模式是对语言不足的补充，如果要使用设计默哀是，不如去找一门更好的语言。比如Object.create就是原型模式的天然实现。但是美中不足是当前的js引擎下通过Object.create来创建对象的效率并不高，通常比通过构造函数创建对象要慢。注：通过构造器的prototype实现原型继承的时候，除了根对象Object.prototyp本身之外，任何对象都会有一个原型。而通过Object.create(null)可以创建出没有原型的对象。

## 3-单例模式
##### 定义：保证一个类仅有一个实力，并提供一个访问它的全局访问点。
应用：如线程池、全局缓存、浏览器中的window对象、当我们点击一个按钮，页面中出现一个浮窗，而这个登录浮窗是唯一的，无论我们单击多少次，这个浮窗都只会被创建一次，那么这个登陆浮窗就适合用单例模式来创建。
>CreateDiv用来在页面上创建div，我们要让这个类再某时可以成为一个单例类,再某时又可以成为一个普通的可以生产多个实例的类，就需要用到代理实现单例模式
#### 3.1-使用代理实现单例模式
    function CreateDiv(html) {
        this.html = html;
        this.init();
    }
    CreateDiv.prototype.init = function () {
        let div = document.createElement("div");
        div.innerHTML = this.html;
        document.body.appendChild(div);
    };
    //代理类
    const ProxSingletonCreatDiv = (function(){
        let instance;
        return function (html){
            if(!instance){
                instance = new CreateDiv(html)
            }
            return instance
        }
    })()
    let a = new ProxSingletonCreatDiv('奥里给1')
    let b = new ProxSingletonCreatDiv('奥里给2')
    console.log('isEqual-----',a===b); // true

#### 3.2-惰性单例
惰性单例是指在需要的时候才创建对象实例。惰性单例在实际开发中非常有用，instance实例对象总是在我们调用Singleton.getInstance的时候才被创建，而不是在页面加载好的时候就创建。
    Singleton.getInstance = (function(){
        let instance = null;
        return function(name){
            if(!instance){
                instance = new Singleton(name)
            }
            return instance
        }
    })()
## 4-策略模式
##### 定义：定义一系列的算法，把他们一个个封装起来，并且使他们可以相互替换 （“可以相互替换”相对于静态语言因为它们有类型检查机制，JS中没有这种困扰，任何对象都可以被替换使用）
* 策略模式的目的就是将算法的使用与算法的实现分离开来
* 策略模式的程序至少由两部分组成，第一部分是一组策略类，封装了具体的算法并负责具体的计算过程。第二部分是环境类Context接受客户的请求随后把请求委托给某一个策略类。
> 例：Javascript中的策略模式，改造奖金计算逻辑：
    let strategies={
        "S": function(salary){
            return salary * 4
        },
        "A": function(salary){
            return salary * 3
        },
        "B": function(salary){
            return salary * 2
        }
    }
    let calculateBonus = function(level,salary){
        return strategies[level](salary)
    }
    console.log( calculateBonus('S', 20000) ) // 输出 80000
#### 策略模式的优缺点：
优点：
- 策略模式利用组合、委托和多态等技术和思想，可以有效地避免多重条件选择语句
- 策略模式提供了对开放—封闭原则的完美支持，将算法封装在独立的 strategy 中，使得它
们易于切换，易于理解，易于扩展。

缺点：
- 使用策略模式会在程序中增加许多策略类或者策略对象，但实际上这比把它们负责的
逻辑堆砌在 Context 中要好

#### 小结：
在 JavaScript 语言的策略模式中，策略类往往被函数所代替，这时策略模式就
成为一种“隐形”的模式。尽管这样，从头到尾地了解策略模式，不仅可以让我们对该模式有更
加透彻的了解，也可以使我们明白使用函数的好处

## 4-代理模式
##### 定义：代理模式是为一个对象提供一个代用品或占位符，以便控制对它的访问
> 例：明星都有经纪人作为代理。如果想请明星来办一场商业演出，只能联系他的经纪人。经纪人会把商业演
出的细节和报酬都谈好之后，再把合同交给明星签。 

###### 客户 -> 代理 -> 本体
保护代理：代理可以帮本体过滤掉一些请求，如年龄太大，或者经济太低的，这种请求可以直接在代理拒绝掉，这种叫保护代理。
虚拟代理：代理可以在监听本体心情好或者不同状态时候去执行客户的操作，这种叫虚拟代理。
**注：保护代理用于控制不同权限的对象对目标对象的访问，但在 JavaScript 并不容易实现保护代理，因为我们无法判断谁访问了某个对象。而虚拟代理是最常用的一种代理模式。**
#### 4.1-缓存代理：
缓存代理可以为一些开销大的运算结果提供暂时的存储，在下次运算时，如果传递进来的参数跟之前一致，则可以直接返回前面存储的运算结果。
> 例：计算乘积
    const mult = function(){
        let a = 1;
        for(let i = 0,l = arguments.length; i <l;i++){
            a = a*arguments[i]
        }
        return a 
    }
    mult(2,3) // 6
    mult(2,3,4) // 24

    const proxyMult = (function(){
        let cache = {};
        return function(){
            let args = Array.prototype.join.call(arguments, ',')
            if(args in cache){
                return cache[args]
            }
            return cache[args] = mult.apply(this,arguments)
        }
    })()
    proxyMult(1,2,3,4) // 24
    proxyMult(1,2,3,4) // 24

#### 4.2-用高阶函数动态创建代理 ：
通过传入高阶函数这种更加灵活的方式，可以为各种计算方法创建缓存代理
>将计算方法当作参数传入入一个专门用于创建缓存代理的工厂中， 这样一来，我们就可以为乘法、加法、减法等创建缓存代理
    /**************** 计算乘积 *****************/
    let mult = function(){
        let a = 1;
        for(let i = 0,l = arguments.length; i <l;i++){
            a = a*arguments[i]
        }
        return a 
    }
    /**************** 计算加和 *****************/
    let plus = function(){ 
        let a = 0; 
        for ( let i = 0, l = arguments.length; i < l; i++ ){ 
            a = a + arguments[i]; 
        } 
        return a; 
    }; 
    /**************** 创建缓存代理的工厂 *****************/
    let createProxyFactory = function( fn ){ 
        let cache = {}; 
        return function(){ 
            let args = Array.prototype.join.call( arguments, ',' ); 
            if ( args in cache ){ 
                return cache[ args ]; 
            } 
            return cache[ args ] = fn.apply( this, arguments ); 
        } 
    }; 
    let proxyMult = createProxyFactory( mult ), 
    proxyPlus = createProxyFactory( plus );

    proxyMult( 1, 2, 3, 4 ) //24
    proxyMult( 1, 2, 3, 4 ) //24
    proxyPlus( 1, 2, 3, 4 ) //10 
    proxyPlus( 1, 2, 3, 4 ) //10

#### 小结：
代理模式包括许多小分类，在 JavaScript 开发中最常用的是虚拟代理和缓存代理。虽然代理模式非常有用，但我们在编写业务代码的时候，往往不需要去预先猜测是否需要使用代理模式。当真正发现不方便直接访问某个对象的时候，再编写代理也不迟。

## 5-迭代器模式
定义:迭代器模式是指提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。迭代器模式可以把迭代的过程从业务逻辑中分离出来，在使用迭代器模式之后，即使不关心对象的内部构造，也可以按顺序访问其中的每个元素(如:Array.prototype.forEach)
>例:当需要在某个项目中实现文件上传模块时,需要根据不同浏览器获取相应的上传组件对象,在不同的浏览器环境下选择的上传方式也是不同的,我们可以把不同的几种上传方式封装在各自的函数中,然后使用一个迭代器迭代获取这些upload对象,直到获取到一个可用的为止.

    var getActiveUploadObj = function(){ 
        try{ 
            return new ActiveXObject( "TXFTNActiveX.FTNUpload" ); // IE 上传控件
        }catch(e){ 
            return false; 
        } 
    }; 
    var getFlashUploadObj = function(){ 
        if ( supportFlash() ){ // supportFlash 函数未提供
            var str = '<object type="application/x-shockwave-flash"></object>'; 
            return $( str ).appendTo( $('body') ); 
        } 
        return false; 
    }; 
    var getFormUpladObj = function(){ 
        var str = '<input name="file" type="file" class="ui-file"/>'; // 表单上传
        return $( str ).appendTo( $('body') ); 
    };
    在 getActiveUploadObj、getFlashUploadObj、getFormUpladObj 这 3 个函数中都有同一个约定：
    如果该函数里面的 upload 对象是可用的，则让函数返回该对象，反之返回 false，提示迭代器继
    续往后面进行迭代。
    迭代器如下:
    var iteratorUploadObj = function(){ 
        for ( var i = 0, fn; fn = arguments[ i++ ]; ){ 
            var uploadObj = fn(); 
            if ( uploadObj !== false ){ 
                return uploadObj; 
            } 
        } 
    };
    var uploadObj = iteratorUploadObj( getActiveUploadObj, getFlashUploadObj, getFormUpladObj );
    我们可以看到，获取不同上传对象的方法被隔离在各自的函数里互不干扰,使得我们可以很方便地的维护和扩展代码。

#### 小结：
迭代器模式是一种相对简单的模式，简单到很多时候我们都不认为它是一种设计模式。目前
的绝大部分语言都内置了迭代器

## 6-发布-订阅模式模式
**定义:**
发布—订阅模式又叫观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。

>例子:A、B、C 去售楼处买房，当ABC都咨询了售楼信息之后离开时，都会将自己电话留下，让销售在有新楼盘推出时 一一发短信通知ABC，这个例子就是典型的发布-订阅模式，ABC都是订阅者，他们订阅了房子开售的消息，销售作为发布者，在合适的时候通知所有购房者 给他们发布消息 。

**优点：**
* 购房者不需要天天打电话给销售咨询开售事件，销售会作为发布者通知这些消息订阅者
* 购房者和销售者不会强耦合在一起，销售者和购房者互不关心，只要销售者记得发短信这件事即可
1. 第一点说明发布—订阅模式可以广泛应用于异步编程中，这是一种替代传递回调函数的方案，如，我们可以订阅 ajax 请求的 error、succ 等事件。或者如果想在动画的每一帧完成之后做一些事情，那我们可以订阅一个事件，然后在动画的每一帧完成之后发布这个事件。在异步编程中使用发布—订阅模式，我们就无需过多关注对象在异步运行期间的内部状态，而只需要订阅感兴趣的事件发生点。
2. 第二点说明发布—订阅模式可以取代对象之间硬编码的通知机制，一个对象不用再显式地调用另外一个对象的某个接口。发布—订阅模式让两个对象松耦合地联系在一起，虽然不太清楚彼此的细节，但这不影响它们之间相互通信。

##### 6.1-发布订阅模式的通用实现：
>例子：将发布订阅listen、trigger、remove单独封装在event对象中，通过installEvent函数给对象安装订阅功能
      const deepClone = (obj) => {
        if (obj === null) return null;
        let clone = Object.assign({}, obj);
        Object.keys(clone).forEach(
          (key) =>
            (clone[key] =
              typeof obj[key] === "object" ? deepClone(obj[key]) : obj[key])
        );
        if (Array.isArray(obj)) {
          clone.length = obj.length;
          return Array.from(clone);
        }
        return clone;
      };

      // 发布订阅模式的通用实现
      let event = {
        clientList: [],
        listen: function (key, fn) {
          // 添加订阅事件
          if (!this.clientList[key]) {
            this.clientList[key] = [];
          }
          this.clientList[key].push(fn);
        },
        trigger: function () {
          // 通知消息
          let key = Array.prototype.shift.call(arguments); // 删除第一个参数,返回删除的项
          let fns = this.clientList[key];
          if (!fns || fns.length === 0) {
            return false; // 如果没有绑定对应的消息
          }
          for (let i = 0, fn; (fn = fns[i++]); ) {
            fn.apply(this, arguments); // arguments是trigger时带上的参数
          }
        },
        remove: function (key, fn) {
          let fns = this.clientList[key];
          if (!fns) {
            return false;
          }
          if (!fn) {
            // 如果没有传入具体的回调函数，表示需要取消 key 对应消息的所有订阅
            fns && (fns.length = 0);
          } else {
            for (var i = fns.length - 1; i >= 0; i--) {
              // 反向遍历订阅的回调函数列表
              var _fn = fns[i];
              if (_fn === fn) {
                fns.splice(i, 1); // 删除订阅者的回调函数
              }
            }
          }
        },
      };

      // 定义 installEvent函数，这个函数可以给所有的对象都动态安装发布订阅功能
      let installEvent = function (obj) {
        for (const key in event) {
          obj[key] = deepClone(event)[key];
        }
      };

      // 定义售楼部
      const salesOfficesA = {};
      const salesOfficesB = {};

      // 给两个售楼部增加发布订阅功能
      installEvent(salesOfficesA);
      installEvent(salesOfficesB);

      // DongDong先生即在A售楼处订阅了楼房信息，也在B售楼处订阅了公寓信息
      let getRoom = (price) => {
        console.log("XiaoMing先生,买房价格：", price);
      }
      let rendRoom = (price) => {
        console.log("XiaoMing先生,租房价格：", price);
      }
      salesOfficesA.listen("XiaoMing", getRoom);
      salesOfficesA.listen("XiaoMing", rendRoom);
      salesOfficesA.listen("DongDong", (price) => {
        console.log("DongDong先生，楼房价格：", price);
      });
      // 取消XiaoMing 租房订阅
      salesOfficesA.remove("XiaoMing",rendRoom)
      // 通知xiaoming先生
      salesOfficesA.trigger("XiaoMing", 8000);

      // 通知dongdong先生
      salesOfficesA.trigger("DongDong", 10000);
      salesOfficesB.listen("DongDong", (price) => {
        console.log("DongDong先生，公寓价格：", price);
      });
      salesOfficesB.trigger("DongDong", 999);

##### 6.2-发布和订阅的先后顺序：
我们所了解到的发布—订阅模式，都是订阅者必须先订阅一个消息，随后才能接收到发布者发布的消息。
在某些情况下，我们需要先将这条消息保存下来，等到有对象来订阅它的时候，再重新把消息发布给订阅者。
如：QQ中的离线消息，离线消息可以保存在服务器中，接收人下次登录上线后，可以重新接收到这条消息。
为了满足我们的发布-订阅对象拥有先发布后订阅的能力，我们需要简历一个存放离线事件的堆栈，当事件发布时，如果此时还没有订阅者来订阅这个事件，我们就暂时把发布事件的动作包裹在一个函数里，这些包装函数将被存入堆栈中，等到终于有对象来订阅此事件的时候，我们将遍历堆栈并且依次执行这些包装函数，也就是重新发布里面的事件。
>注：当然离线事件的生命周期只有一次，就像 QQ 的未读消息只会被重新阅读一次，所以刚才的操作我们只能进行一次
##### 6.3-JavaScript 实现发布－订阅模式的便利性
区别其他语言,在 JavaScript 中，我们用注册回调函数的形式来代替传统的发布—订阅模式，显得更加优雅和简单。
* 推模型：指在事件发生时，发布者一次性把所有更改的状态和数据都推送给订阅者
* 拉模型：发布者仅仅通知订阅者事件已经发生了，此外发布者要提供一些公开的接口供订阅者来主动拉取数据。
>注：在 JavaScript 中，arguments 可以很方便地表示参数列表，所以我们一般都会选择推模型，
使用 Function.prototype.apply 方法把所有参数都推送给订阅者。
#### 小结：
优点：
1. 时间和对象之间的解耦
2. 实现别的设计模式，如 中介者模式，从架构上来看无论是MVC还是MVVM都少不了发布-订阅模式的参与

缺点：
1. 创建订阅者本身需要消耗一定的内存
2. 如果过度使用会弱化对象之间的联系，导致程序难以跟踪后后续同事的理解

## 7-命令模式
**用途：**
有时候需要向某些对象发送请求，但是并不知道请求的接收者是谁，也不知道被请
求的操作是什么，此时希望用一种松耦合的方式来设计软件，使得请求发送者和请求接
收者能够消除彼此之间的耦合关系。
##### 7.1- JavaScript中的命令模式
JavaScript 作为将函数作为一等对象的语言，跟策略模式一样，命令模式也早已融入到了JavaScript 语言之中。
区别于其他语言传统通过面向对象的方式实现命令模式，我们使用闭包可以完成同样的功能
> 例：将绘制的按钮，和点击按钮将触发的具体事件分离开来
    // 给button设置命令
    let setCommand = function(button,command){
      button.onclick = function(){
        command.execute()
      }
    }
    // 触发button点击的具体操作对象
    let MenuBar = {
      refresh:function(){
        console.log('刷新菜单')
      }
    }
    // 命令
    var RefreshMenuBarCommand = function( receiver ){ 
      return {
        // 想更明确地表达当前正在使用命令模式，或者除了执行命令之外，将来有可能还要提供撤销命令等操作。那我们最好还是把执行函数改为调用 execute 方法
        execute:function(){ 
          receiver.refresh(); 
        } 
      }
    }; 
    let refreshMenuBarCommand = RefreshMenuBarCommand( MenuBar ); 
    setCommand( button1, refreshMenuBarCommand );
#### 小结：
通过命令模式可以实现撤销、重做、排队等功能，或者文本编辑器的Ctrl+Z功能，和策略模式的区别：command对象解决的目标更具发散性。JavaScript 可以用高阶函数非常方便地实现命令模式。命令模式在 JavaScript 语言中是一种隐形的模式
## 8-组合模式
在程序设计中，也有一些和“事物是由相似的子事物构成”类似的思想。组合模式就是用小的子对象来构建更大的对象，而这些小的子对象本身也许是由更小的“孙对象”构成的
**组合模式的用途：**
组合模式将对象组合成树形结构，以表示“部分-整体”的层次结构。 
除了用来表示树形结构之外，组合模式的另一个好处是通过对象的多态性表现，使得用户对单个对象和组合对象的使用具有一致性
1. 表示树形结构。组合模式可以非常方便地描述对象部分-整体层次结构
2. 利用对象多态性统一对待组合对象和单个对象。利用对象的多态性表现，可以使客户端忽略组合对象和单个对象的不同。在组合模式中，客户将统一地使用组合结构中的所有对象，而不需要关心它究竟是组合对象还是单个对象,比如只需要有execute方法就可以添加到树中。
>这在实际开发中会给客户带来相当大的便利性，当我们往万能遥控器里面添加一个命令的时候，并不关心这个命令是宏命令还是普通子命令。这点对于我们不重要，我们只需要确定它是一个命令，并且这个命令拥有可执行的 execute 方法，那么这个命令就可以被添加进万能遥控器。当宏命令和普通子命令接收到执行 execute 方法的请求时，宏命令和普通子命令都会做它们各自认为正确的事情。这些差异是隐藏在客户背后的，在客户看来，这种透明性可以让我们非常自由地扩展这个万能遥控器。
**注意：**
1. 组合模式不是父子关系,他的树形结构是一种HAS-A（聚合）的关系，组合对象把请求委托给它所包含的所有叶对象，它们能够合作的关键是拥有相同的接口。
2. 对叶对象操作的一致性。组合模式除了要求组合对象和叶对象拥有相同的接口之外，还有一个必要条件，就是对一组
叶对象的操作必须具有一致性。
3. 双向映射关系，在某些情况下需要给父子节点建立双向映射关系，但是对象之间产生了过多的耦合性，我们可以通过中介者模式来管理这些对象
4. 用职责链模式提高组合模式性能：在组合模式中，如果树的结构比较复杂，节点数量很多，我们可以借助职责链模式中避免遍历整棵树
**何时使用组合模式**
1. 表示对象的部分-整体层次结构。组合模式可以方便地构造一棵树来表示对象的部分整
体结构。特别是我们在开发期间不确定这棵树到底存在多少层次的时候。在树的构造最
终完成之后，只需要通过请求树的最顶层对象，便能对整棵树做统一的操作。在组合模
式中增加和删除树的节点非常方便，并且符合开放封闭原则。
2. 客户希望统一对待树中的所有对象。组合模式使客户可以忽略组合对象和叶对象的区别，
客户在面对这棵树的时候，不用关心当前正在处理的对象是组合对象还是叶对象，也就
不用写一堆 if、else 语句来分别处理它们。组合对象和叶对象会各自做自己正确的事情，
这是组合模式最重要的能力。
#### 小结：
* 优点：组合模式可以让我们使用树形方式创建对象的结构。我们可以把相同的操作应用在组合对象和单个对象上。从而用一致的方式来处理它们。
* 缺点：使代码难以理解，系统中的每个对象看起来都与其他对象差不多。它们的区别只有在运行的时候会才会显现出来
## 9-模板方法模式
**定义：**
* 模板方法模式是一种只需使用继承就可以实现的非常简单的模式
* 模板方法模式由两部分结构组成，第一部分是抽象父类，第二部分是具体的实现子类。
> 例：咖啡和茶，他们的不同点：
原料不同：一个是咖啡，一个是茶，但我们可以把它们都抽象为“饮料”。
泡的方式不同：咖啡是冲泡，而茶叶是浸泡，我们可以把它们都抽象为“泡”。
加入的调料不同：一个是糖和牛奶，一个是柠檬，但我们可以把它们都抽象为“调料”。
因此我们可以将泡咖啡或者是泡茶整理为以下四步：
1-把水煮沸
2-用沸水冲泡饮料
3-用沸水冲泡饮料
4-用沸水冲泡饮料

    // 01-创建抽象父类
    var Beverage = function(){};
    Beverage.prototype.boilWater = function(){ 
      console.log( '把水煮沸' ); 
    }; 
    Beverage.prototype.brew = function(){}; // 空方法，应该由子类重写
    Beverage.prototype.pourInCup = function(){}; // 空方法，应该由子类重写
    Beverage.prototype.addCondiments = function(){}; // 空方法，应该由子类重写
    Beverage.prototype.init = function(){ 
      this.boilWater(); 
      this.brew(); 
      this.pourInCup(); 
      this.addCondiments(); 
    };
    // 02-创建Coffee 子类和 Tea 子类
    var Coffee = function(){}; 
    Coffee.prototype = new Beverage();
    var Tea = function(){}; 
    Tea.prototype = new Beverage();

    // 03-重写父类方法
    Coffee.prototype.brew = function(){ console.log( '用沸水冲泡咖啡' ); }; 
    Coffee.prototype.pourInCup = function(){ console.log( '把咖啡倒进杯子' );}
    Coffee.prototype.addCondiments = function(){ console.log( '加糖和牛奶' ); }; 
    var Coffee = new Coffee();
    Coffee.init();
    // Tea 类的方法也同上重写 创建Tea类
    Tea.prototype.brew = ...
    ...

**上面的例子中，Beverage.prototype.init 被称为模板方法，因为该方法中封装了子类的算法框架，它作为一个算法的模板，指导子类以何种顺序去执行哪些方法。在 Beverage.prototype.init 方法中，算法内的每一个步骤都清楚地展示在我们眼前。**
注：模板方法模式是一种严重依赖抽象类的设计模式。JavaScript 在语言层面并没有提供对抽象类的支持，我们也很难模拟抽象类的实现。
在Java中类分为两种，一种为具体类，另一种为抽象类。具体类可以被实例化，抽象类不能被实例化。
#### 小结：
* 在 Java 中编译器会保证子类会重写父类中的抽象方法，但在 JavaScript 中却没有进行这些检查工作。特别是当我们使用模板方法模式这种完全依赖继承而实现的设计模式时，这时是很危险的(可以通过自己在抽象类方法抛出异常或者使用ts来减少这种危险)
* 从大的方面来讲，模板方法模式常被架构师用于搭建项目的框架，架构师定好了框架的骨架，程序员继承框架的结构之后，负责往里面填空

## 10-享元模式
**定义：将对象的属性划分为内部状态与外部状态（状态在这里通常指属性）。把所有内部状态相同的对象都指定为同一个共享的对象。而外部状态可以从对象身上剥离出来，并储存在外部。从而节省内存**
何时使用：
* 一个程序中使用了大量的相似对象。
* 由于使用了大量对象，造成很大的内存开销。
* 对象的大多数状态都可以变为外部状态。
* 剥离出对象的外部状态之后，可以用相对较少的共享对象取代大量对象。
#### 小结：
享元模式是为解决性能问题而生的模式，这跟大部分模式的诞生原因都不一样。在一个存在
大量相似对象的系统中，享元模式可以很好地解决大量对象带来的性能问题。
扯淡

## 11-职责链模式
**定义：使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系，将这些对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理它为止。**
    Function.prototype.after = function (fn) {
        const self = this;
        return function (...args) {
            const result = self.apply(null, args);
            return fn.call(null, result);
        };
    };
    const compose = function (...args) {
        if (args.length) {
            return args.reduce(function (f1, f2) {
                return f1.after(f2);
            });
        }
    };
## 12-中介者模式
**定义：中介者模式的作用就是解除对象与对象之间的紧耦合关系。增加一个中介者对象后，所有的相关对象都通过中介者对象来通信，而不是互相引用，所以当一个对象发生改变时，只需要通知中介者对象即可。**
## 13-装饰者模式
**定义：装饰者模式可以动态地给某个对象添加一些额外的职责，而不会影响从这个类中派生的其他对象。**
#### 13.1-使用AOP装饰函数

        // Function.prototype.before 接受一个函数当作参数，这个函数即为新添加的函数，它装载了新添加的功能代码。
        Function.prototype.before = function( beforefn ){ 
          var __self = this; // 保存原函数的引用
          return function(){ // 返回包含了原函数和新函数的"代理"函数
            beforefn.apply( this, arguments ); // 执行新函数，且保证 this 不被劫持，新函数接受的参数
            // 也会被原封不动地传入原函数，新函数在原函数之前执行
            return __self.apply( this, arguments ); // 执行原函数并返回原函数的执行结果，
            // 并且保证 this 不被劫持
          } 
        } 
        //Function.prototype.after 的原理跟 Function.prototype.before 一模一样，唯一不同的地方在于让新添加的函数在原函数执行之后再执行。
        Function.prototype.after = function( afterfn ){ 
          var __self = this; 
          return function(){ 
            var ret = __self.apply( this, arguments ); 
            afterfn.apply( this, arguments ); 
            return ret; 
          } 
        };
        // 先打印123 再获取 button对象
        document.getElementById = document.getElementById.before(function () {
          console.log(2);
        }).after(function(){
            console.log(3)
        }).before(function(){
            console.log(1)
        });
        var button = document.getElementById("button");

        // 上面的装饰函数before和after 是在Function原型上做的修改，我们如果不想污染原型，那么可以改成一个函数
        var before = function( fn, beforefn ){ 
          return function(){ 
            beforefn.apply( this, arguments ); 
            return fn.apply( this, arguments ); 
          } 
        }
#### 13.2-装饰者模式和代理模式
这两种模式非常相像都描述了怎样为对象提供一定程度上的间接引用，它们的实现部分都保留了对另外一个对象的引用，并且向那个对象发送请求。
代理模式的目的是，当直接访问本体不方便或者不符合需要时，为这个本体提供一个替代者。
装饰者模式的作用就是为对象动态加入行为。
#### 小结
我们了解了装饰函数，它是 JavaScript 中独特的装饰者模式。在写一些函数时如果是稳定且方便移植的功能，我们可以通过装饰着模式去添加一些个性化功能。
## 14-状态模式
**关键：状态模式的关键是区分事物内部的状态，事物内部状态的改变往往会带来事物的行为改变。**
**定义：允许一个对象在其内部状态改变时改变它的行为，对象看起来似乎修改了它的类。**
> 例：电灯案例，电灯可以有几种状态：第一次按-弱光、第二次按-正常光、第三次按-强光、第四次按-关灯
        var Light = function(){ 
          this.offLightState = new OffLightState( this ); // 持有状态对象的引用
          this.weakLightState = new WeakLightState( this ); 
          this.strongLightState = new StrongLightState( this ); 
          this.superStrongLightState = new SuperStrongLightState( this ); 
          this.button = null; 
        };
        // Light对象初始化方法
        Light.prototype.init = function(){ 
          let self = this; 
          let button = document.createElement( 'button' );
          this.button = document.body.appendChild( button ); 
          this.button.innerHTML = '开关'; 

          this.currState = this.offLightState; // 设置默认初始状态
          this.button.onclick = function(){ // 定义用户的请求动作
            self.currState.buttonWasPressed(); 
          } 
        };
        // 编写各种状态类，light 对象被传入状态类的构造函数，状态对象也需要持有 light 对象的引用，以便调用 light 中的方法或者直接操作 light 对象
        var OffLightState = function( light ){ 
          this.light = light; 
        }; 
        OffLightState.prototype.buttonWasPressed = function(){ 
          console.log( '弱光' ); 
          this.light.setState( this.light.weakLightState ); 
        };
        var WeakLightState = function( light ){ 
          this.light = light; 
        }; 
        WeakLightState.prototype.buttonWasPressed = function(){ 
          console.log( '弱光' ); 
          this.light.setState( this.light.weakLightState ); 
        };
#### 小结：
优点：
* 状态模式定义了状态与行为之间的关系，并将它们封装在一个类里。通过增加新的状态类，很容易增加新的状态和转换。
* 避免 Context 无限膨胀，状态切换的逻辑被分布在状态类中，也去掉了 Context 中原本过多的条件分支。
* 用对象代替字符串来记录当前状态，使得状态的切换更加一目了然。
* Context 中的请求动作和状态类中封装的行为可以非常容易地独立变化而互不影响。

缺点：
* 状态模式的缺点是会在系统中定义许多状态类
和策略模式差不多一模一样，靠不同目的意图去区分
## 15-适配器模式
**作用：解决两个软件实体间的接口不兼容的问题。使用适配器模式之后，原本由于接口不兼容而不能工作的两个软件实体可以一起工作。**
        var googleMap = { 
          show: function(){ 
            console.log( '开始渲染谷歌地图' ); 
          } 
        }; 
        var baiduMap = { 
          display: function(){ 
           console.log( '开始渲染百度地图' ); 
          } 
        };
        // 定义适配器
        var baiduMapAdapter = { 
          show: function(){ 
            return baiduMap.display();
          }
        }
        renderMap( googleMap ); // 输出：开始渲染谷歌地图
        renderMap( baiduMapAdapter ); // 输出：开始渲染百度地图
#### 小结
* 适配器模式主要用来解决两个已有接口之间不匹配的问题，它不考虑这些接口是怎样实
现的，也不考虑它们将来可能会如何演化。适配器模式不需要改变已有的接口，就能够
使它们协同作用。
* 装饰者模式和代理模式也不会改变原有对象的接口，但装饰者模式的作用是为了给对象
增加功能。装饰者模式常常形成一条长的装饰链，而适配器模式通常只包装一次。代理
模式是为了控制对对象的访问，通常也只包装一次。

# 设计原则和编程技巧
## 16-单一职责原则
原则体现：一个对象（方法）只做一件事情。
职责过多就会变得不稳定和危险
* 一方面，如果随着需求的变化，有两个职责总是同时变化，那就不必分离他们。
* 另一方面，职责的变化轴线仅当它们确定会发生变化时才具有意义，即使两个职责已经被耦
合在一起，但它们还没有发生改变的征兆，那么也许没有必要主动分离它们，在代码需要重构的
时候再进行分离也不迟。
SRP 原则的优点是降低了单个类或者对象的复杂度，按照职责把对象分解成更小的粒度，
这有助于代码的复用，也有利于进行单元测试。当一个职责需要变更的时候，不会影响到其他
的职责。
## 17-最少知识原则
最少知识原则要求我们在设计程序时，应当尽量减少对象之间的交互。如果两个对象之间不
必彼此直接通信，那么这两个对象就不要发生直接的相互联系。常见的做法是引入一个第三者对
象，来承担这些对象之间的通信作用。如果一些对象需要向另一些对象发起请求，可以通过第三
者对象来转发这些请求。(中介者模式)
## 18-开放—封闭原则
> 例：扩展 window.onload 函数
通过动态装饰函数的方式，我们完全不用理会从前 window.onload 函数的内部实现，无论它
的实现优雅或是丑陋。就算我们作为维护者，拿到的是一份混淆压缩过的代码也没有关系。只要
它从前是个稳定运行的函数，那么以后也不会因为我们的新增需求而产生错误。

## 19-代码重构



