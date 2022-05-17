# Module的加载实现

了解如何在**浏览器**和**Node.js**中加载ES6模块



### 1.浏览器加载

```html
<!-- 页面内嵌脚本 -->
<script type="application/javascript">
</script>

<!-- 外部脚本 -->
<script type="application/javascript" src="....">
</script>

<!-- 由于浏览器脚本的默认语言是 JavaScript，因此type="application/javascript"可以省略。 -->
```

注意：默认情况下，浏览器是同步加载 JavaScript 脚本，即渲染引擎遇到script标签就会停下来等待脚本执行完毕再继续向下渲染。如果脚本体积大，下载和执行的时间就会过长，造成浏览器的阻塞，因此浏览器允许脚本异步加载。

```html
<script src="path/to/myModule.js" defer></script>
<script src="path/to/myModule.js" async></script>
```

**defer** 和 **async** 的区别：

- defer：要等到整个页面在内存中正常渲染结束（DOM结构完全生成，以及其他脚本执行完毕）才会执行；
- async：一旦下载完，渲染引擎就会中断渲染，执行这个脚本以后，再继续渲染；

总结一句话：**defer是“渲染完再执行” async是 "下载完就执行"，如果有多个defer脚本，则会按照页面中出现的顺序加载，而多个async脚本则不能保证加载顺序**



### 2. 加载规则

```html
<!--浏览器加载ES6模块，也是用script标签，但是要加入 type="module" 属性-->
<script type="module" src="./foo.js"></script>

<!-- 等同于 -->
<script type="module" src="./foo.js" defer></script>
```

注意：**浏览器对于带有 type="module"的script标签，不会造成浏览器的阻塞，等同于打开了script标签的 defer 属性**

对于外部的脚本，需要注意几点：

- 代码是在模块作用域之中运行，而不是在全局作用域运行。模块内部的顶层变量，外部不可见。
- 模块脚本自动采用严格模式，不管有没有声明`use strict`。
- 模块之中，可以使用`import`命令加载其他模块（`.js`后缀不可省略，需要提供绝对 URL 或相对 URL），也可以使用`export`命令输出对外接口。
- 模块之中，顶层的`this`关键字返回`undefined`，而不是指向`window`。也就是说，在模块顶层使用`this`关键字，是无意义的。
- 同一个模块如果加载多次，将只执行一次。

```javascript
// 利用顶层的this等于undefined这个语法点，可以侦测当前代码是否在 ES6 模块之中。
const isNotModuleScript = this !== undefined;
```



### 3.ES6模块 和 CommonJS模块的差异

ES6模块和CommonJS的三个重大差异：

1. CommonJS 模块输出的是一个**值的拷贝**，ES6模块输出的是**值的引用**
2. CommonJS 模块是**运行时加载**，ES6模块是**编译时输出接口**
3. CommonJS 模块的`require()`是**同步加载模块**，ES6模块的Import是**异步加载**，有一个独立的模块依赖的解析阶段。

第二个差异是因为 CommonJS 加载的是一个对象（即`module.exports`属性）,该对象只有再脚本运行完才会生成。而ES6模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。

第一个差异解释：**值的拷贝**：一旦输出一个值，模块内部的变化就影响不到这个值了。

```javascript
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
};

// main.js
var mod = require('./lib');
console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 3

// 以上说明lib.js模块加载以后，它的内部变化就影响不到输出的mod.counter了。
```

ES6 模块的运行机制与 CommonJS 不一样。JS 引擎对脚本静态分析的时候，遇到模块加载命令`import`，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。原始值变了，`import`加载的值也会跟着变。因此，ES6 模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。

```javascript
// lib.js
export let counter = 3;
export function incCounter() {
  counter++;
}

// main.js
import { counter, incCounter } from './lib';
console.log(counter); // 3
incCounter();
console.log(counter); // 4

// 上面代码说明，ES6 模块输入的变量counter是活的，完全反应其所在模块lib.js内部的变化。
```



### 4.Node.js 的模块加载方法

#### 4.1概述

JavaScript 现在有两种模块。一种是 ES6 模块，简称 **ESM**；另一种是 CommonJS 模块，简称 **CJS**。CommonJS 模块是 Node.js 专用的，与 ES6 模块不兼容。语法上两者最明显的差异是：**CJS 使用 require 和 module.export,而ESM使用 import 和 export**。

> 注：Node.js 从 v13.2 版本开始 已经默认打开了ES6模块支持

Node.js 要求 ES6模块采用**.mjs**后缀文件名。也就是说只要是文件中使用了import或者 export命令，就需要使用这个后缀名。因此Node.js遇到.mjs文件，就会默认启用严格模式，不必在每个模块顶部指定“use strict”。

如果不希望将后缀名改为**.mjs**,可以在项目的 package.json文件中，指定type字段为module：

```json
{
   "type": "module"
}
```

一旦设置了以后，该项目的 JS 脚本，就被解释成 ES6 模块。

如果这时还要用CJS模块的话，那么将脚本后缀名改成.cjs或者type字段为commonjs 就行了。

小结：**`.mjs`文件总是以 ES6 模块加载，`.cjs`文件总是以 CommonJS 模块加载，`.js`文件的加载取决于`package.json`里面`type`字段的设置。**

注意：**ES6 模块与 CommonJS 模块尽量不要混用**。因为require不能加载.mjs文件，会报错，.mjs文件必须用import命令

#### 4.2 package.json 的 main 字段 和 export 字段

package.json文件有两个字段可以指定模块的入口文件：**`main`和`exports`**

```json
// ./node_modules/es-module-package/package.json
{
  "type": "module",
  "main": "./src/index.js"
}

// 上面代码指定项目的入口脚本为./src/index.js，它的格式为 ES6 模块。如果没有type字段，index.js就会被解释为 CommonJS 模块。
// ---------------------------------------------------------------------------------------------
// 然后，import命令就可以加载这个模块:

// ./my-app.mjs
import { something } from 'es-module-package';
// 实际加载的是 ./node_modules/es-module-package/src/index.js
```

**而export字段的优先级高于main字段**，它有多种用法。

```json
// 1.设置子目录别名

// ./node_modules/es-module-package/package.json
{
  "exports": {
    "./submodule": "./src/submodule.js"
  }
}

// 指定src/submodule.js别名为submodule，然后就可以从别名加载这个文件：
import submodule from 'es-module-package/submodule';
// 加载 ./node_modules/es-module-package/src/submodule.js
```

```json
// 2.main的别名

// export 字段的别名如果是 . 就代表模块的主入口优先级高于main字段，并可以直接写成export字段的值：

{
  "exports": {
    ".": "./main.js"
  }
}

// 等同于
{
  "exports": "./main.js"
}

//-----------------------------------------------------------------------------------------

// 由于 export 字段只有支持ES6的 Node.js才认识(> v13.6)，所以可以用兼容旧版的Node.js：
{
  "main": "./main-legacy.cjs", // 老版本的入口文件
  "exports": {
    ".": "./main-modern.cjs" // 新版本的入口文件
  }
}
```

```javascript
// 3.条件加载

// 利用.这个别名，可以为 ES6 模块和 CommonJS 指定不同的入口。目前，这个功能需要在 Node.js 运行的时候，打开--experimental-conditional-exports标志。
{
  "type": "module",
  "exports": {
    ".": {
      "require": "./main.cjs",
      "default": "./main.js"
    }
  }
}
// 简写如下：
{
  "exports": {
    "require": "./main.cjs", // 指定require()命令的入口文件（即 CommonJS 的入口）
    "default": "./main.js" // 指定其他情况的入口（即 ES6 的入口）
  }
}
```

#### 4.3 CommonJS 模块 和 ES6 模块的加载

**CommonJS 的 require 命令不能加载ES6模块，会报错，只能用 import() 这个方法加载**。因为require不支持ES6模块的一个原因是，它是同步记载的，而ES6模块内部可以使用顶层 await命令，导致无法同步加载。

```javascript
// 下列代码可以在CommonJS模块中运行
(async () => {
  await import('./my-app.mjs'); // 能用 import() 这个方法加载
})();
```

ES6 的import 命令，可以加载CommonJS 模块，但是**只能整体加载，不能只加载单一的输出项：**

```javascript
// 正确
import packageMain from 'commonjs-package';

// 报错
import { method } from 'commonjs-package';
```

另一种变通加载方法：使用Node.js内置的`module.createRequire()`方法，但是不建议使用，因为这种写法等于将ESM和CJS混在了一起。

#### 4.4 同时支持两种格式的模块

一个模块同时要支持 CJS 和 ESM两种格式，那么需要给出一个整体输出接口，如 **export default obj**, 让 CJS 可以使用**import()** 进行加载。

```javascript
// 如果原始模块是 CommonJS 格式，那么可以加一个包装层。
// 先整体输入 CommonJS 模块，然后再根据需要输出具名接口。
import cjsModule from '../index.js';
export const foo = cjsModule.foo;

// 可以把这个文件的后缀名改为.mjs，或者将它放在一个子目录，再在这个子目录里面放一个单独的package.json文件，指明{ type: "module" }
```

另一种做法是在`package.json`文件的`exports`字段，指明两种格式模块各自的加载入口。

```json
"exports"：{
  "require": "./index.js"，
  "import": "./esm/wrapper.js"
}
// 上面代码指定require()和import，加载该模块会自动切换到不一样的入口文件。
```

#### 4.5 内部变量

ES6模块是通用的，同一个模块不用修改，就可以用在浏览器和服务器环境。为了达到这个目标，Node.js规定 **ES6模块中不能使用CJS模块特有的一些内部变量**

 	1. 首先就是**this关键字**，ES6模块之中，顶层的this指向undefined；CommonJS模块顶层this指向当前模块，这是两者的一个重大差异
 	2. arguments
 	3. require
 	4. module
 	5. exports
 	6. __filename
 	7. __dirname

#### 4.6 CommonJS模块的加载原理

CommonJS的一个模块，就是一个脚本文件。require命令第一次加载该脚本，就会执行整个脚本，然后在内存生成一个对象：

```js
{
  id: '...', // 模块名
  exports: { ... }, // 模块输出的各个接口
  loaded: true, // 该模块脚本是否执行完毕
  ...
}
```

该对象的id属性是模块名，exports属性是模块输出的各个接口，loaded属性是一个布尔值，标识该模块的脚本是否执行完毕。其他还有很多属性，这里都省略了。

**以后需要用到这个模块的时候，就会到exports属性上面取值。就算执行require命令，也不会再次执行该模块，而是到缓存之中取值。也就是说，CommonJS模块无论加载多少次，都只会在第一次加载时运行一次，以后再加载，就会返回第一次运行的结果，除非手动清楚缓存。**

#### 4.7 循环加载

[Module 的加载实现 - ECMAScript 6入门 (ruanyifeng.com)](https://es6.ruanyifeng.com/#docs/module-loader#%E5%BE%AA%E7%8E%AF%E5%8A%A0%E8%BD%BD)























