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

那么解析器是如何切割的？**依据有限状态自动机**：所谓有限状态，就是指有限个状态，而"自动机"一位着随着字符的输入，解析器会自动的在不同状态间迁移。如分析上述模板字符串时，`parse`函数会逐个读取字符，状态机会有一个初始状态，记为“初始状态1”，在此状态下读取模板的第一个字符<,状态机就会进入下一个状态：“标签开始状态2”，再接着是字符p便进入“标签名称状态3”，然后再到字符> 即回到了“初始状态1”......略。这个解析HTML并构造Token的过程是有规范可循的，参照WHATWG发布的规范我们就可以根据有限自动状态机的迁移过程来编写对应的代码实现`tokenize`函数。**补充：实现`tokenize`函数可以通过正则表达式来精简代码，其实正则表达式的本质就是有限自动机。当你在编写正则时就是在编写有限自动机。**

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
`generate`函数：访问JavaScript AST的节点，为每种节点生成相符合的JavaScript 代码。












