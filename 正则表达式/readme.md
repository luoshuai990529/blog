<!--
 * @Date: 2021-12-26 15:12:32
 * @LastEditors: Lewis
 * @LastEditTime: 2021-12-26 15:12:33
     -->

### 1-正则表达式

正则表达式(Regular Expression)其实就是一门工具，**目的**是为了字符串模式匹配，从而实现搜索和替换功能。它是一种**用来描述规则的表达式**，当我们学习正则的时候可以通过https://regexper.com/这个工具来可视化我们写的正则表达式，从而帮助我们更好的理解和学习正则表达式。

####1.1-构建一个正则表达式

```javascript
// 1-用一个正则表达式字面量，其由包含在斜杠之间的模式组成。当正则表达式保持不变时，使用此方法可获得更好的性能。
let reg = /abc/;
// 2-使用构造函数创建，如果正则表达式将会改变，或者将会从用户输入动态产生就用构造函数生成正则
let reg = new RegExp("abc");
```

####1.2-元字符和字符

正则表达式的基本**组成元素**可以分为：**字符和元字符**。

- **字符**：就是字符本身的含义，不需要多想
- **元字符**：即特殊字符，它改变了字符本身的含义，如^表示非，|表示或...(相当于JS的关键字)                           11个元字符(关键字) ： [] ^  {}  ()  + . | $  \  * ?

##### 开始

最简单的正则可以由数字和字母组成，例：

```javascript
/*
	/abc/ 含义：检查字符串中有没有 abc 这个字符串，注意：即不是说有a或b或c，也不是说 有a和b和c。
	通过RegExp.prototype.test():来测试我们的正则该方法执行一个检索，用来查看正则表达式与指定的字符串是否匹配。返回 true 或 false
*/
/abc/.test('a123'); // false
/abc/.test('a1b1c1'); // false
/abc/.test('abc123'); // true
/马飞/.test('一匹马在飞');// false
/马飞/.test('牛逼啊，马飞'); // true
```

####1.3-字符类（字符组）

```javascript
/*
	/[abc]/ 含义：将a和b和c 这三类字符归为一类(相同特征)
	        人话：有a , b , c 这三个字符任意一个即可
*/
/[abc]/.test('a123456'); // true
/[abc]/.test('b123456'); // true
/[abc]/.test('c123456'); // true
/[abc]/.test('123456');  // false
/[abc]/.test('abc123456'); // true
```

#### 1.4-反向类（排除字符组）

```javascript
/*
	/[^abc]/ 含义：将 没有a 或 没有b 或 没有c的字符串归为一类
	         人话：没有 a,b,c 这三个字符任意一个即可
*/
/[^abc]/.test('a111'); // true
/[^abc]/.test('b222'); // true
/[^abc]/.test('c333'); // true
/[^abc]/.test('123456'); // true
/[^abc]/.test('abc123'); // true  解释：能找到不是a或b或c的字符1、2、3
/[^abc]/.test('aaabbbccc'); // false 解释：找不到不是a或b或c的字符，这个字符串全是由a、b、c组成的
```

#### 1.5-范围类（范围表示法）

```javascript
/*	
	例：
	/[0-9]/ 含义：0-9之间的任意字符  （数字）
	/[a-z]/ 含义：a-z之间的任意字符  （小写字母）
    /[A-Z]/ 含义：A-Z之间的任意字符  （大写字母）
    注意点：
    	1-范围类是一个闭区间
    	2-范围类右边一定要大于左边，如：
    		正确写法：[5-8]
    		错误写法：[8-5]
    		正确写法：[8-90-5] 解释：匹配 8 9 0 1 2 3 4 5
    		错误写法：[9-85-0]
*/

/[0-9]/.test('abc'); // false
/[0-9]/.test('abc0'); // true
/[0-9]/.test('123456'); // true

/[a-z]/.test('abc'); // true
/[a-z]/.test('123456'); // false
/[a-z]/.test('ABC123'); // false

// /[0-9a-zA-Z]/ 含义：只要有 数字 或者 字母 即可
/[0-9a-zA-Z]/.test('a'); // true
/[0-9a-zA-Z]/.test('A'); // true
/[0-9a-zA-Z]/.test('5'); // true
/[0-9a-zA-Z]/.test('aA123,.?+'); // true
/[0-9a-zA-Z]/.test(',.?+'); // false

// 如果遇到字符组里的字符特别多的话如：[123456abcdefGHIJKLM] 怎么办？可以使用范围表示法 例：
/[1-6a-fG-M]/.test('123abCGHI'); // true
/[1-6a-fG-M]/.test('789'); // false
```

#### 1.6-预定义类

**预定义类**：预先定义好的正则(正则表达式作者提前把一些常用的正则写给开发者使用)

| 预定义类 | 等价类           | 含义                    |
| ---- | ------------- | --------------------- |
| .    | [^\r\n]       | 除了回车\r和换行\n之外的所有字符    |
| \d   | [0-9]         | 数字字符                  |
| \D   | [^0-9]        | 非数字字符                 |
| \s   | [\f\n\r\t\v]  | 空白字符 (空格、制表符、换页符和换行符) |
| \S   | [^\f\n\r\t\v] | 非空白字符                 |
| \w   | [a-zA-Z0-9_]  | 单词字符（字母、下划线、数字）       |
| \W   | [^a-zA-Z0-9_] | 非单词字符                 |

```javascript
// /./ 匹配除了回车和换行之外的任意字符
/./.test(''); // false 空字符串
/./.test('\n'); // false 换行符 用户看不到任何东西
/./.test('safsaf'); // true
/./.test(' '); // true 空格字符串
/./.test('你\n是\n谁'); // true

// \d 匹配任意数字
/\d/.test('abc'); // false
/\d/.test('abc1'); // true

// \D 匹配任意非字符
/\D/.test('abc'); // true
/\D/.test('abc1'); // true
/\D/.test('123456'); // false

// \s 匹配空白字符
/\s/.test('我爱你们'); // false
/\s/.test('我\t爱你们'); // true
/\s/.test('我爱你\n们'); // true

// \S 匹配任意非空字符
/\S/.test('我爱你们'); // true
/\S/.test('我\t爱你们'); // true
/\S/.test('我爱你\n们'); // true
/\S/.test('\t\n\f'); // false

// \w 匹配任意单词字符（字母、下划线、数字） [a-zA-Z0-9_]
/\w/.test('_'); // true
/\w/.test('aA'); // true
/\w/.test('123'); // true 
/\w/.test('+-*/'); // false

// \W 匹配任意非单词字符
/\W/.test('_'); // false
/\W/.test('aA'); // false
/\W/.test('123'); // false
/\W/.test('+-*/'); // true
```

#### 1.7-边界

正则表达式提供了几个常用的边界匹配字符

| 边界字符 | 含义     |
| ---- | ------ |
| ^    | 以xxx开头 |
| $    | 以xxx结尾 |
| \b   | 单词边界   |
| \B   | 非单词边界  |

```javascript
/*
	注意点：元字符的含义不止一种，例：
		/[^abc]/ 反向类，含义：不是 a或b或c 的任意字符
		/^abc/   边界，  含义：以a开头 + bc
*/
/^abc/.test('123abc'); // false 解释：虽然有abc字符串，但是a位置不是开头第一个
/^abc/.test('a1b1c1'); // false 
/^abc/.test('abc123'); // true

/*	
	/abc$/
	正确含义：ab+c(结尾位置)
	错误含义：以abc结尾
*/
/abc$/.test('123abc'); // true
/abc$/.test('a1b1c1'); // false
/abc$/.test('abc123'); // false

/*
	严格匹配：/^abc$/ 只有唯一答案：abc
	正确含义：(开头)a + b + c(结尾)
	错误含义：以abc开头 + 以abc结尾
*/
/^abc&/.test('abc1'); // false
/^abc&/.test('1abc'); // false
/^abc$/.test('abcabc'); // false
/^abc$/.test('abc'); // true

/*
	边界：限制位置 单词： 字母+数字+下划线
	\b	单词边界
	\B  非单词边界
*/
//  /\bis/ : 单词边界。 替换单词is
'This is a boy'.replace(/\bis/,'X') // This X a boy  解释：这里的 'is' 是一个单词
//  /\Bis/ : 非单词边界。 替换非单词is
'This is a boy'.replace(/\Bis/,'X') // ThX is a boy  解释：This 中的 'is' 不是一个单词
```

#### 1.8-量词

量词：表示字符出现的数量

| 量词    | 含义               |
| ----- | ---------------- |
| ?     | 出现0次或者1次（最多出现1次） |
| +     | 出现1次或者多次（最少出现1次） |
| *     | 出现0次或者多次（任意次）    |
| {n}   | 出现n次             |
| {n,m} | 出现n-m次           |
| {n,}  | 最少出现n次（>=n）      |

```javascript
/*
	匹配字符串中的 数字 连续出现11次
	/\d\d\d\d\d\d\d\d\d\d\d/ 含义：任意数字 连续出现11次
	/\d{11}/                 含义：任意数字 连续出现11次
*/
// 测试时 光使用test无法理解 '量词' 之间的区别 例：
/\d?/.test('123456789'); // true
/\d+/.test('123456789'); // true
/\d*/.test('123456789'); // true
/\d{5}/.test('123456789'); // true
/\d{5,8}/.test('123456789'); // true
/\d{5,}/.test('123456789'); // true
// 我们可以通过字符串的 replace方法 来 了解每一种量词的区别，例：
let str = '123456789'
str.replace(/\d?/,'X'); // 'X23456789'
str.replace(/\d+/,'X'); // 'X'
str.replace(/\d*/,'X'); // 'X'
// 量词使用最多的是 {} 
str.replace(/\d{5}/,'X'); // 'X6789'
str.replace(/\d{5,8}/,'X'); // 'X9'
str.replace(/\d{5,}/,'X'); // 'X'
```

#### 1.9-分组

() 元字符有三种含义：

1. 分组 ：将多个字符 分为一组 （当做一个整体）
   - 默认**量词**只能用于一个字符，如果希望用于多个字符，则可以使用**分组**


2. 提升优先级：
   - 通常与元字符 | 一起使用
   - 默认 | 会对两边所有的字符串生效，如果希望 | 只对某一个字符生效，就可以使用 () 提升优先级
3. 反向引用：
   - 正则表达式在进行匹配的时候，会存储小括号中匹配到的数据，放入 静态成员中
   - 静态成员 : ` RegExp.$1 - RegExp.$9`

案例1：

```javascript
// 需求：匹配连续出现3次 love 的字符串

// /love{3}/ 含义： lov + e(出现3次)
/love{3}/.test('lovelovelove'); // false
/love{3}/.test('loveeeeee123'); // true

// /(love){3}/ 含义： (love) 出现3次
/(love){3}/.test('lovelovelove'); // true
/(love){3}/.test('loveeeeee123'); // false
```

案例2：

```javascript
// 需求：匹配  love  或者  live
// /lo|ive/    含义是 有 lo  或者 ive
/lo|ive/.test('lo111'); // true
/lo|ive/.test('111ive'); // true
/lo|ive/.test('love'); // true

// /l(o|i)ve/  含义是  l  + i或者o + ve
/l(o|i)ve/.test('lo111'); // false
/l(o|i)ve/.test('111ive'); // false
/l(o|i)ve/.test('love'); // true
/l(o|i)ve/.test('live'); // true
```

案例3：

```javascript
// 需求 ： 将 yyyy-mm-dd 的字符串 变成  mm/dd/yyyy 格式
// 大陆生产日期 ： 2021-12-27  香港生产日期 :  12/27/2021
// tips:反向引用 ： 正则表达式在进行匹配的时候，会存储小括号中匹配到的数据，放入 静态成员中
let date = '2021-12-27'
let newDate = date.replace(/(\d{4})-(\d{2})-(\d{2})/,'$2/$3/$1'); // 12/27/2021
RegExp.$1 // 2021
RegExp.$2 // 12
RegExp.$3 // 27
```

#### 2.0-修饰符

修饰符：影响整个正则规则的特殊符号

书写位置：**/pattern/modifiers(修饰符)**

- i (intensity)：大小写不敏感（不区分大小写）
- g (global) : 全局匹配
- m(multiple) : 检测换行符，使用较少，主要影响字符串的开始^与结束$边界

```javascript
// /a/i 不区分大小写
'AAaaaAA'.replace(/a/,'X'); // 'AAXaaAA'   默认正则区分大小写
'AAaaaAA'.replace(/a/i,'X'); // 'XAaaaAA'  i:不区分大小写
// /a/g 全局匹配
'AAaaaAA'.replace(/a/,'X'); // 'AAXaaAA'   默认正则只能匹配第一个
'AAaaaAA'.replace(/a/g,'X'); // 'AAXXXAA'  g : 全局（所有字符）匹配
// 注意点：修饰符可以写多个 */
'AAaaaAA'.replace(/a/ig,'X'); // XXXXXXX   g:全局匹配 i:不区分大小写

// 检测换行符 /a/m 注意：需要与边界一起使用才有结果
let str = '我觉得我真聪明\n我觉得我真聪明\n我觉得我真聪明';
//需求： 把每一行的开头的 我 替换成 你
str.replace(/我/,'你'); // 只能替换第一个'我'
str.replace(/我/g,'你'); // 替换所有的'我'

// 下面也无法实现  虽然用户看到的三个我是在开头位置，但是在字符串中每一行只是一个特殊字符\n
str.replace(/^我/g,'你'); // 只会替换第一个'我'

// 正确写法：m  检测换行符，将换行符后面的第一个字，也作为开头的位置
str.replace(/^我/gm,'你')
```

