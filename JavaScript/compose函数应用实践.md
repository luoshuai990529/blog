<!--
 * @Date: 2021-12-20 16:31:01
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2021-12-20 16:32:12
  -->

### 前置知识

#### 1.函数式编程( FP ) 概述

函数式编程已经不再是一个新的概念，它具有完善清晰的原则，如果我们可以理解这些原则，我们就能很方便的读懂代码合定为问题。函数式编程目的是为了数据流更加明显，从而代码更具可读性

思考：下面是两种不同的修改x的值的代码写法

```javascript
let x = null;
function foo(y){
  x = Math.floor(Math.random()*y)
}
foo(11)
x; 
```

```javascript
let x = null;
function foo(){
  return Math.floor(Math.random()*y)
}
x = foo(11)
x;
```

上面的案例中，第一种给x 赋值是**隐式**的输出，而第二种通过return是一个**显式**的输出

何为**隐式**和**显式**？看下一段代码

```javascript
function sum(list){
	const total = 0;
  	for(let i = 0; i < list.length; i++){
        if(!list[i]) list[i] = 0 // list 使用了 nums 的引用
    	total += list[i]
    }
    return total
}
let nums = [1,2,3,null,5]
sum(nums) // 11
```

上面的代码中，函数**sum**除了return输出，其实还是有其他的操作修改到了外部参数nums, 即便是我们无意的修改了nums中的值，在JS中对数组、对象、函数都是用引用和引用复制，我们可以很容易地从函数中创建输出，即使是无心的。

这个隐式函数输出在函数式编程中有一个特殊的名称：**副作用**

而没有副作用的函数也有一个特殊的名称：**纯函数**



