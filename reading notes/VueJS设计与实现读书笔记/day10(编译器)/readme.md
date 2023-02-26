# 编译器

编译技术是一门庞大的学科，如果要实现诸如C、JavaScript这类通用用途语言，就需要掌握较多编译技术知识。根据场景领域的不同涉及的技术难度也不同。Vue.js的模板和JSX都属于领域特定语言，他们的实现难度属于中、低级别，只要掌握基本的编译技术理论即可实现这些功能。

**要点1：什么是编译器？**
编译器只是一段程序，它用来将“一种语言A”翻译成“另外一种语言B”。其中语言A通常叫做源代码，语言B通常叫做目标代码。这个被翻译的过程叫做编译。

**要点2：`Vue.js`的模板编译器的流程**
`Vue.js`的模板作为DSL(domain-specific language 专注于某个领域的特定语言)，编译流程有所不同。对于其编译器来说，源代码就是组件的模板，目标代码是能够在浏览器上运行的JavaScript代码(渲染函数`render`)。如：
![image-20230223181425910](https://lewis-note.oss-cn-beijing.aliyuncs.com/github/image-20230223181425910.png)
详细而言，它的工作流程是，`Vue.js`的编译器首先会对组件模板进行词法分析和语法分析(`parse`函数)，得到模板AST(抽象语法树)，接着将模板AST转换成JavaScript AST(`transform`函数)。最后根据AST生成JavaScript代码(`generate`函数)。

**要点3：parse的实现原理和状态机**
parser解析器会根据传入的字符串模板和一定的规则将整个字符串切歌为一个个**Token(词法记号)**。如函数`tokenize('<p>Vue</p>')` 会将这段字符串切割为三个Token，返回：

```javascript
[
	{ type: 'tag', name: 'p' }, // 开始标签
	{ type: 'text', content: 'Vue' }, // 文本节点
	{ type: 'tagEnd', name: 'p' } // 结束标签
]
```

那么解析器是如何切割的？**依据有限状态自动机构建一个词法分析器**：所谓有限状态，就是指有限个状态，而"自动机"一位着随着字符的输入，解析器会自动的在不同状态间迁移。如分析上述模板字符串时，`parse`函数会逐个读取字符，状态机会有一个初始状态，记为“初始状态1”，在此状态下读取模板的第一个字符<,状态机就会进入下一个状态：“标签开始状态2”，再接着是字符p便进入“标签名称状态3”，然后再到字符> 即回到了“初始状态1”......略。这个解析HTML并构造Token的过程是有规范可循的，参照WHATWG发布的规范我们就可以根据有限自动状态机的迁移过程来编写对应的代码实现`tokenize`函数。**补充：实现`tokenize`函数可以通过正则表达式来精简代码，其实正则表达式的本质就是有限自动机。当你在编写正则时就是在编写有限自动机。**

一个完善的解析器远比想象复杂，其中包括了完整的错误处理和状态机的状态迁移流程，当解析器在遇到不同的特殊标签时会切换不同的文本模式去对文本进行解析，如：解析`title、textarea`标签时会用RCDATA模式；解析`style、iframe、noscript`标签时会用RAWTEXT模式；解析`<![CDATA[`字符串时会用CDATA模式；在解析模板构建AST的过程中，`parseChildren`函数式核心，其中利用递归下降算法构建AST(随着标签嵌套层次的增加该函数也会不断的递归调用，被递归调用的下级`parseChildren`函数用于构建下级模板AST)。

**状态机怎么运行？又怎么结束？**状态机遍历模板字符串时通过`while`循环让其自动运行，解析器遇到开始标签时会将改标签压入父级节点栈，同时开启新的状态机。当解析器遇到结束标签，并且父级节点栈中存在与该标签同名的开始标签节点时，会停止当前正在运行的状态机。

**要点4：根据模板解析生成后的Token构建AST**
我们已经有了`tokenize`函数可以将给出的模板进行标记化了，根据其Token列表构建AST的过程就是对Token的列表进行扫描的过程。

```javascript
 const tokens = tokenize(`<div><p>Vue</p><p>Template</p></div>`)
 // 返回tokens结果
 const tokens = [
  {type: "tag", name: "div"}, // div 开始标签节点
  {type: "tag", name: "p"}, // p 开始标签节点
  {type: "text", content: "Vue"}, // 文本节点
  {type: "tagEnd", name: "p"}, // p 结束标签节点
  {type: "tag", name: "p"}, // p 开始标签节点
  {type: "text", content: "Template"}, // 文本节点
  {type: "tagEnd", name: "p"}, // p 结束标签节点
  {type: "tagEnd", name: "div"} // div 结束标签节点
 ]
 // 接着我们要扫描tokens列表，将其构建为AST
```

这个过程要如何实现呢？

1. 维护一个`elementStack`这个栈用于维护元素间的父子关系。每遇到一个开始标签节点，就构造一个Element类型的AST节点，将其压入栈中。
2. 当遇到一个结束标签节点，就将当前栈顶的节点弹出，这样栈顶的节点将始终充当父节点的角色。扫描过程中的其他所有节点，都会作为当前栈顶节点的子节点，并添加到栈顶节点的children属性下。

有了这个过程，我们编写代码就可以将上述的tokens列表转换成：
```javascript
const ast = {
 	// AST 的逻辑根节点
 	type: 'Root',
 		children: [
 			// 模板的 div 根节点
 			{
	 			type: 'Element',
 				tag: 'div',
 				children: [
 							// div 节点的第一个子节点 p
							{
 								type: 'Element',
 								tag: 'p',
 								// p 节点的文本节点
 								children: [{type: 'Text', content: 'Vue'}]
 							},
 							// div 节点的第二个子节点 p
 							{
 								type: 'Element',
 								tag: 'p',
 								// p 节点的文本节点
								 children: [{type: 'Text', content: 'Template'}]
 							}
                         ]
             }
 		]
}
```

**要点5：我们已经完成了AST构造，那么如何对模板AST进行转换为 JS AST呢？**
将模板编译为渲染函数的过程，其实就是通过`transform`来完成AST转换的。首先，我们需要能访问AST的每一个节点，因为由于AST是树形数据结构，所以我们先需要一个**深度优先**的遍历算法，实现对AST中节点的访问(`traverseNode`函数)。实现了可以对AST的操作函数`traverseNode`函数后，现在就可以来实现将模板AST转换成渲染函数了。
**什么是JavaScript AST? 例：**

```javascript
// <div><p>Vue</p><p>Template</p></div> 这里的模板转换成等价的渲染函数如下：
function render() {
	return h('div', [
    	h('p', 'Vue'),
        h('p', 'Template')
    ])
}

// 那么这个渲染函数所对应的JS AST是什么样的呢？如下：
const FunctionDeclNode = {
	type: 'FunctionDecl', // 代表该节点是函数声明
    id: {
		type: 'Identifier',
        name: 'render', // name 用来存储标识符的名称，在这里它就是渲染函数的render
    },
    params: [], // 参数 目前渲染函数还不需要参数，因此是一个空数组
    body: [
        {
            type: 'ReturnStatement', 
            // 最外层的h函数调用
            return {
            	type: 'CallExpression',
            	callee: { type:'Identifier', name: 'h'},
        		arguments: [
    				// 第一个参数是字符串字面量 'div'
        			{
        				type: 'StringLiteral',
        				value: 'div'
        			},
      				{
                    	type: 'ArrayExpression',
                        elements: [
                        // 数组的第一二个元素都是 h 函数的调用
                        	{
								type: 'CallExpression',
                        		callee: { type: 'Identifier', name: 'h'}，
                                arguments: {
									// 该 h 函数调用的第一个参数是字符串字面量
									{ type: 'StringLiteral', value: 'p' },
									// 第二个参数也是一个字符串字面量
									{ type: 'StringLiteral', value: 'Vue' },
								}
							},
                            {
								type: 'CallExpression',
                        		callee: { type: 'Identifier', name: 'h'}，
                                arguments: {
									// 该 h 函数调用的第一个参数是字符串字面量
									{ type: 'StringLiteral', value: 'p' },
									// 第二个参数也是一个字符串字面量
									{ type: 'StringLiteral', value: 'Template' },
								}
							}
						]
                    }
    			]
        	}
        }
    ]
}

```

那么如何编写转换函数？

1. 编写一些用来创建JavaScript AST的辅助函数，如：
   ```javascript
   // 用来创建StringLiteral节点：
   function createStringLiteral(value) {
   	return {
   		type: 'StringLiteral',
   		value
   	}
   }
   // 创建Identifier、ArrayExpression节点 ... 略
   ```

2. 编写`transformElemnt、transformText`两个函数处理标签节点和文本节点。无论是文本节点还是标签节点，处理完后的JavaScript AST节点都存储在节点的`node.jsNode`属性下。

3. 最后还需要一个`transformRoot`函数来对Root根节点的转换，因为上述两个函数只能把模板转换为h函数的调用。处理后便可以将模板AST转换成对应的JavaScript AST了。

**要点6：有了JavaScript AST的构造我们如何将其生成渲染函数的代码？**
`generate`函数：访问JavaScript AST的节点，为每种节点生成相符合的JavaScript 代码。在函数内部定义了`context`上下文对象，里面包含了`context.code`属性用来储存最终生成的渲染函数代码，还有`context.push`函数用来完成代码拼接，接着调用`genNode`完成生成代码的工作，最后返回渲染函数。在`genNode`内部，使用`switch`语句来匹配不同类型的节点，并调用与之对应的生成器函数。如：对于`FunctionDecl`节点，就使用`genFunctionDecl`函数生成对应的JavaScript代码。代码生成的过程就是字符串拼接的过程。这个过程中还涉及到了代码的缩进和换行，我们将缩进和换行封装成工具函数，定义到代码生成的上下文`context`中以便调用。

**要点7：编译器将模板编译为渲染函数的过程中进行的优化**

1. **动态节点收集：**在比较传统的Diff算法时我们能知道，无论哪一种Diff算法，当其对比两颗新旧虚拟DOM树时都会要按照虚拟DOM层级结构去遍历对比，有时候的对比是无意义的操作。而我们通过编译的手段就可以在编译时分析出很多关键的信息，如哪些节点是静态哪些是动态的。结合这些信息编译器就可以直接操作原生DOM操作的代码，这样甚至就可以抛弃掉虚拟DOM从而避免虚拟DOM带来的性能开销。但为了兼容Vue2的问题，因此Vue3还是保留了虚拟DOM。

2. **补丁标志**：Vue3的编译器在编译时得到的关键信息会将其附着在生成的虚拟DOM上，这些信息会通过虚拟DOM传递给渲染器。最终渲染器会根据这些信息去优化提升运行时的性能。在描述元素的虚拟节点时，通过`patchFlag`的标识来表明它是一个动态节点，同时它也是补丁标志(可以理解为一系列数字标记)，根据数字值得不同赋予其不同的含义，如：1-代表节点有动态的`textContent`；2-代表元素有动态的`class`绑定；3-代表元素有动态`style`绑定...;有了这个信息在虚拟节点创建时，就可以将它的动态子节点提取出来并将它存储到节点的`dynamicChildren`数组内，有这个属性的节点也被称为**BLOCK块**，有了这个概念，渲染器更新BLOCK时就会忽略虚拟接单的children数组，而是直接找到该节点的`dynamicChildren`数组并只更新数组中的动态节点即可。补充：其他的特殊节点如带有 `v-if v-for`指令的节点也都会被当做BLOCK角色。

3. **静态提升：**它可以减少更新时创建虚拟DOM的性能开销和内存占用。

   ```javascript
   /**
   	<div> 
           <p> static text </p>
           <p> {{ title }} </p>
       </div>
   **/
   // 上述模板会被编译成如下渲染函数：
   function render () {
   	return (openBlock(), createBlock('div', null, [
       	createVNode('p', null, 'static text'),
           createVNode('p', null, ctx.title, 1 /* TEXT */)
       ]))
   }
   // 而如果有了静态提升，我们可以将纯静态的虚拟节点的创建提取出来，避免重新创建（静态props同理）：
   const hosit1 = createVNode('p', null, 'static text'),
   function render () {
   	return (openBlock(), createBlock('div', null, [
       	hosit1, // 静态节点的引用
           createVNode('p', null, ctx.title, 1 /* TEXT */)
       ]))
   }
   ```

4. **预字符串化：**基于静态提升的一种优化策略。当遇到大量连续纯静态的标签节点，我们可以将其直接序列化为字符串，并生成一个Static类型的`VNode`，这样的大块静态内容可以通过`innerHTML`进行设置，在性能上具有一定的优势也可以减少虚拟节点产生的性能开销，减少内存占用。

5. **缓存内联事件处理函数：**当一个模板绑定了一个`change`事件：`<Com @change="xxx"/>`每次重新渲染时，其`render`函数重新执行时都会为此组件创建一个全新的`props`对象，该对象里面的`onChange`属性的值也是全兴的函数。这就导致了渲染器对Com组件进行更新造成额外的开销。为了避免这样的更新，我们就可以对内联事件处理函数用cache进行缓存。这样在渲染函数重新执行创建虚拟DOM树时会优先读取缓存中的事件，这样就不会触发组件的更新了。其实`v-once`指令也是利用这个cache数组来缓存渲染函数的全部或者部分执行结果，被缓存后自然该模板内容就不会重新被创建虚拟节点和参与Diff操作，该指令通常可以用于不会发生改变的动态绑定中可以用于提升性能：`<div v-once>{{ SOME_CONSTANT }}</div>`,它可以避免组件更新时重新创建虚拟DOM带来的性能开销以及无用的Diff开销。











