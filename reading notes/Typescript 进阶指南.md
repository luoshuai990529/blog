#### null 和 undefined 和特殊类型 void

```typescript
// string 类型会被认为包含了 null 与 undefined 类型：
const tmp3: string = null; // 仅在关闭 strictNullChecks 时成立，下同
const tmp4: string = undefined;

// 特殊类型 void：void 操作符会执行后面跟着的表达式并返回一个 undefined，如你可以使用它来执行一个立即执行函数（IIFE）：
void function iife() {
  console.log("Invoked!");
}();
// void 操作符会强制将后面的函数声明转化为了表达式 相当于：
void((function iife(){})())
// 下面的 func1 返回值类型会被隐式推导为 void
function func1() {} 
// 我们可以认为 void表示一个空类型
const voidVar1: void = undefined;
const voidVar2: void = null; // 需要关闭 strictNullChecks
```

#### 数组的类型标注

```typescript
const arr1: string[] = [];
const arr2: Array<string> = [];

// 如果我们只存放固定长度的变量，那么用 元组来代替数组更妥当：
const arr3: [string, string, string] = ['L', 'E', 'S']

arr3[3] // 此时越界访问会出现类型报错

// 同时元组也支持在某一个位置上的可选成员：
const arr4: [string, number?, boolean?] = ['lewis'];
             
// Typescript4.0中还提供了 具名元组：
const arr5: [name: string, age: number, male?: boolean] = ['lewis', 18, true];
```

#### 对象的类型标注

```typescript
// 使用接口interface 给对象类型进行标注：
interface IDescription {
  readonly name: string; // 通过readonly可以标记其属性只读
  age: number;
  male?: boolean;
  func?: Function;
}

const obj2: IDescription = {
  name: 'lewis',
  age: 19,
  male: true,
  // 无需实现 func 也是合法的
};
```

##### type 与 interface

**interface **用来描述对象、类的结构，而**类型别名type**用来将一个函数签名、一组联合类型、一个工具类型等等抽离成一个完整独立的类型。

**在任何情况下，你都不应该使用这些装箱类型(Object、String、Boolean、Number、Symbol)。**

### 掌握字面量类型和枚举

```typescript
// 描述一个响应的消息结构：关于字面量类型，我们可以使用它来提供更精确的类型标注。
interface Res {
  code: 10000 | 10001 | 50000;
  status: "success" | "failure";
  data: any;
}
// 注意：无论是原始类型还是对象类型的字面量类型，它们的本质都是类型而不是值


// 枚举：
enum ProductType {
  ArticleType = "type1",
  ImageType = "type2",
  VideoType = "type3",
  AudioType = 1, // 可以同事是字符串枚举和数字枚举
}
```

### 函数的类型签名

```typescript
// 方式一
const foo = (name: string): number => {
  return name.length
}

// 方式二(可读性差 不推荐)
const foo: (name: string) => number = (name) => {
  return name.length
}

// 没有返回值的函数 使用void类型标注
function foo(): void { }

// 在函数逻辑中注入可选参数默认值
function foo1(name: string, age?: number): number {
  const inputAge = age || 18; // 或使用 age ?? 18
  return name.length + inputAge
}

// 使用 TypeScript 提供的函数重载签名,实现将入参类型和返回值类型的可能情况进行关联，获得更精确的类型标注能力。
// 注意：拥有多个重载声明的函数在被调用时，是按照重载的声明顺序往下查找的
function func(foo: number, bar: true): string;
function func(foo: number, bar?: false): number;
function func(foo: number, bar?: boolean): string | number {
  if (bar) {
    return String(foo);
  } else {
    return foo * 599;
  }
}

const res1 = func(599); // number
const res2 = func(599, true); // string
const res3 = func(599, false); // number

// 异步函数
async function asyncFunc(): Promise<void> {} // 关于泛型我们会在后面进行详细了解
```

### Class类与类成员的类型签名

```typescript
// 在ts中我们可以为Class成员添加修饰符：public / private / protected / readonly
class Foo {
  private prop: string;

  constructor(inputProp: string) {
    this.prop = inputProp;
  }
  
  static staticHandler(){} // 我们可以用static来标识一个成员为静态成员(无法通过 this 来访问，需要通过 Foo.staticHandler 这种形式进行访问。)
  // 注意：静态成员直接被挂载在函数体上，而实例成员挂载在原型上，这就是二者的最重要差异：静态成员不会被实例继承，它始终只属于当前定义的这个类（以及其子类）。
  
  protected print(addon: string): void {
    console.log(`${this.prop} and ${addon}`)
  }

  public get propA(): string {
    return `${this.prop}+A`;
  }

  public set propA(value: string) {
    this.propA = `${value}+A`
  }
}
```

SOLID原则了解：

- S，**单一功能原则**，**一个类应该仅具有一种职责**
- O，**开放封闭原则**，**一个类应该是可扩展但不可修改的**
- L，**里式替换原则**，**一个派生类可以在程序的任何一处对其基类进行替换**
- I，**接口分离原则**，**类的实现方应当只需要实现自己需要的那部分接口**
- D，**依赖倒置原则**，这是实现开闭原则的基础，它的核心思想即是**对功能的实现应该依赖于抽象层**，即不同的逻辑通过实现不同的抽象类


### any、unknown和never

```typescript
// unknown 和 any 的一个主要差异体现在赋值给别的变量时简单地说，any 放弃了所有的类型检查，而 unknown 并没有。这一点也体现在对 unknown 类型的变量进行属性访问时
let unknownVar: unknown;
unknownVar.foo(); // 报错：对象类型为 unknown

// 注：在类型未知的情况下，更推荐使用 unknown 标注。

// 虚无的never类型(内置类型 never 就是这么一个“什么都没有”的类型,相比于void，never还要更空白)
// 严格来说，never 类型不携带任何的类型信息,因此会在联合类型中被直接移除
type UnionWithNever = "lewis" | 599 | true | void | never; // 将鼠标悬浮在类型别名之上，你会发现这里显示的类型是"lewis" | 599 | true | void。

// 通常我们不会显式地声明一个 never 类型，它主要被类型检查所使用。但在某些情况下使用 never 确实是符合逻辑的，比如一个只负责抛出错误的函数
function justThrow(): never {
  throw new Error()
}
```

### 类型断言：警告编译器不准报错

```typescript
// 类型断言的正确使用方式是，在 TypeScript 类型分析不正确或不符合预期时，将其断言为此处的正确类型
// 基本语法是 as NewType
interface IFoo {
  name: string;
}

declare const obj: {
  foo: IFoo
}

const {
  foo = {} as IFoo
} = obj

// 需要注意的是，类型断言应当是在迫不得己的情况下使用的。虽然说我们可以用类型断言纠正不正确的类型分析，但类型分析在大部分场景下还是可以智能地满足我们需求的。
// 总的来说，在实际场景中，还是 as any 这一种操作更多。(小心使用)

// 非空断言：使用 ! 语法，即 obj!.func()!.prop 的形式标记前面的一个声明一定是非空的，应用的位置类似可选链
foo.func!().prop!.toFixed(); // 非空断言
foo.func?.().prop?.toFixed(); // 可选链
```

### 类型别名和工具类

```typescript
// 类型别名的作用主要是对一组类型或一个特定类型结构进行封装，以便于在其它地方进行复用。如抽离一组联合类型：
type StatusCode = 200 | 301 | 400 | 500 | 502;
type PossibleDataTypes = string | number | (() => unknown);
const status: StatusCode = 502;

// 在类型别名中，一旦接受了泛型，我们就叫它工具类型：
type Factory<T> = T | number | stringtype MaybeNull<T> = T | null;

// 一些其他常使用的工具类：
type MaybeNull<T> = T | null;
type MaybeArray<T> = T | T[];

// 总之，对于工具类型来说，它的主要意义是基于传入的泛型进行各种类型操作，得到一个新的类型。
```

### 交叉类型

```typescript
interface NameStruct {
  name: string;
}

interface AgeStruct {
  age: number;
}

type ProfileStruct = NameStruct & AgeStruct; // 需要同时满足NameStruct和AgeStruct

const profile: ProfileStruct = {
  name: "lewis",
  age: 18
}
```

### 索引类型

```typescript
// 索引类型指的不是某一个特定的类型工具，它其实包含三个部分：索引签名类型、索引类型查询与索引类型访问。

// 索引签名类型:快速声明一个键值类型一致的类型结构
interface AllStringTypes {
  [key: string]: string;
}
type AllStringTypes = {
  [key: string]: string;
}

// 索引类型查询:keyof 操作符。严谨地说，它可以将对象中的所有键转换为对应字面量类型，然后再组合成联合类型
interface Foo {
  lewis: 1,
  998: 2
}
type FooKeys = keyof Foo; // "lewis" | 998

// 索引类型访问:我们在js中可以通过obj[expression]来动态访问一个对象属性，而TS中我们也可以通过类似方式，只是expression要换成类型
interface NumberRecord {
  [key: string]: number;
}
type PropType = NumberRecord[string]; // number
```

### 映射类型

```typescript
// 映射类型的主要作用即是 基于键名映射到键值类型。
type Stringify<T> = {
  [K in keyof T]: string;
};

// 使用：
interface Foo {
  prop1: string;
  prop2: number;
  prop3: boolean;
  prop4: () => void;
}
type StringifiedFoo = Stringify<Foo>;
// 等价于
interface StringifiedFoo {
  prop1: string;
  prop2: string;
  prop3: string;
  prop4: string;
}

// 既然能拿到key，那键的值类型我们也能拿到：
type Clone<T> = {
  [K in keyof T]: T[K]; // T[K]属于索引类型访问。
};
```

### 类型守卫

```typescript
// is关键字：显式的提供类型信息
function isString(input: unknown): input is string {
  return typeof input === "string";
}

function foo(input: string | number) {
  if (isString(input)) {
    // 是string类型 ...
  }
  if (typeof input === 'number') { }
  // ...
}
```

### 泛型

```typescript
// 类型别名中的泛型:等价于一个接受参数的函数
type Factory<T = boolean> = T | number | string; // 泛型还能声明一个默认值

// 类型别名中的泛型大多是用来进行工具类型封装,如映射类型中的工具类：
type Stringify<T> = {
  [K in keyof T]: string;
};
type Clone<T> = {
  [K in keyof T]: T[K];
};

// 泛型约束：使用 extends 关键字来约束传入的泛型参数必须符合要求
// 根据传入的请求码判断请求是否成功，这意味着它只能处理数字字面量类型的参数(也可以设置默认值)
type ResStatus<ResCode extends number = 10000> = ResCode extends 10000 | 10001 | 10002
  ? 'success'
  : 'failure';
type Res1 = ResStatus<10000>; // "success"
type Res2 = ResStatus<20000>; // "failure"
type Res3 = ResStatus<'10000'>; // 类型“string”不满足约束“number”。

// 泛型提供了对类型结构的复用能力，我们也经常在对象类型结构中使用泛型
interface IRes<TData = unknown> {
  code: number;
  error?: string;
  data: TData;
}
interface IPaginationRes<TItem = unknown> {
  data: TItem[];
  page: number;
  totalCount: number;
  hasNextPage: boolean;
}
interface IUserProfileRes {
  name: string;
  homepage: string;
  avatar: string;
}
             
// 泛型嵌套
function fetchUserProfileList(): Promise<IRes<IPaginationRes<IUserProfileRes>>> {}


// 函数中的泛型：
// T 会自动地被填充为这个参数的类型, 注意：如果你使用一个变量作为参数，那么只会使用这个变量标注的类型（在没有标注时，会使用推导出的类型）
function handle<T>(input: T): T {}

// 函数中的泛型同样存在约束与默认值:
function handle<T extends string | number>(input: T): T {}
```

### Class中的泛型

```typescript
// 函数中泛型参数的消费方是 参数 和 返回值 类型
// Class 中的泛型消费方则是 属性、方法、乃至装饰器 等
class Queue<TElementType> {
  private _list: TElementType[];

  constructor(initial: TElementType[]) {
    this._list = initial;
  }

  // 入队一个队列泛型子类型的元素
  enqueue<TType extends TElementType>(ele: TType): TElementType[] {
    this._list.push(ele);
    return this._list;
  }

  // 入队一个任意类型元素（无需为队列泛型子类型）
  enqueueWithUnknownType<TType>(element: TType): (TElementType | TType)[] {
    return [...this._list, element];
  }

  // 出队
  dequeue(): TElementType[] {
    this._list.shift();
    return this._list;
  }
}
```

### 内置方法中的泛型

```typescript
// Promise:填充 Promise 的泛型以后，其内部的 resolve 方法也自动填充了泛型
function p() {
  return new Promise<boolean>((resolve, reject) => {
    resolve(true);
  });
}
// 数组Array<T>:
const arr: Array<number> = [1, 2, 3];
// 类型“string”的参数不能赋给类型“number”的参数。
arr.push('lewis');
// 类型“string”的参数不能赋给类型“number”的参数。
arr.includes('lewis');

// React的泛型坑位：
const [state, setState] = useState<number[]>([]);
// 不传入默认值，则类型为 number[] | undefined
const [state, setState] = useState<number[]>();
// 体现在 ref.current 上
const ref = useRef<number>();
const context =  createContext<ContextType>({});
```

### 结构化类型系统

```typescript
// 结构类型的别称：鸭子类型
// 核心理念：如果你看到一只鸟走起来像鸭子，游泳像鸭子，叫得也像鸭子，那么这只鸟就是鸭子；也就是说，鸭子类型中两个类型的关系是通过对象中的属性方法来判断的。
// 结构化类型系统认为 Dog 类型完全实现了 Cat 类型,下面不会报错
class Cat {
  eat() { }
}
class Dog {
  bark() { }
  eat() { }
}
function feedCat(cat: Cat) { }
feedCat(new Dog())

// 标称类型系统:两个可兼容的类型，其名称必须是完全一致的
type USD = number;
type CNY = number;

const CNYCount: CNY = 200;
const USDCount: USD = 200;

function addCNY(source: CNY, input: CNY) {
  return source + input;
}

addCNY(CNYCount, USDCount)

// 对于标称类型系统，父子类型关系只能通过显式的继承来实现，称为标称子类型
class Cat { }
// 实现一只短毛猫！
class ShorthairCat extends Cat { }

// 通过交叉类型的方式来实现信息的附加：
export declare class TagProtector<T extends string> {
  protected __tag__: T;
}
// 使用具有protected 属性的类 来携带额外的信息，并和原本的类型合并到一起，就得到了 Nominal 工具类型。
export type Nominal<T, U extends string> = T & TagProtector<U>;
// 现在修改上述的例子
export type CNY = Nominal<number, 'CNY'>;
export type USD = Nominal<number, 'USD'>;
const CNYCount = 100 as CNY;
const USDCount = 100 as USD;
function addCNY(source: CNY, input: CNY) {
  return (source + input) as CNY;
}
addCNY(CNYCount, CNYCount);
// 报错了！
addCNY(CNYCount, USDCount);
```

### 条件类型

```typescript
// 条件类型绝大部分场景下会和泛型一起使用
type LiteralType<T> = T extends string ? "string" : "other";
type Res1 = LiteralType<"lewis">; // "string"
type Res2 = LiteralType<599>; // "other"

// infer关键字：在条件类型中提取类型的某一部分信息
type FunctionReturnType<T extends Func> = T extends (...args: any[]) => infer R ? R : never;
// 解释：当传入的类型参数满足 T extends (...args: any[]) 这样的结构(忽略 infer R,当它成any就行)，返回 infer R 位置的值，即R。否则，返回 never。上例中类型信息需要是一个函数类型结构，我们才能提取出它的返回值类型。如果连函数类型都不是，那我只会给你一个 never 
// infer是 inference 的缩写，意为推断，如 infer R 中 R 就表示 待推断的类型。
// infer 只能在条件类型中使用
```

### 内置工具类型

```typescript
// 结构工具类型：快速声明一个结构，如内置类型中的 Record：
type Record<K extends keyof any, T> = {
	[P in K]: T;
}
            
// 键名均为字符串，值类型未知
type Record1 = Record<string, unknown>
// 键名均为字符串，值类型任意
type Record2 = Record<string, any>
// 键名为字符串或数字，值类型任意
type Record3 = Record<string | number, any>

// Pikc:保留传入的键，接收两个泛型参数，T是我们会进行结构处理的原类型，而K则被约束为T类型的键名联合类型。
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
interface Foo {
  name: string;
  age: number;
  job: JobUnionType;
}

type PickedFoo = Pick<Foo, "name" | "age">


// Omit:Pick类型的反向实现，即剔除这些传入的键
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

### 了解类型编程和类型体操的意义

我们通常把TypeScript中的类型操作分为：“类型编程” 和 “体操类型” 这两类。**“类型编程”**：对于实际开发中真的有帮助的类型操作，只要是真的对实际开发有帮助的类型操作，无论实现多么复杂，都能被归类于类型编程当中。**“类型体操”：** 你可能看到过基于 TypeScript 类型实现的四则远算、斐波那契数列、象棋、Lisp 编译器这一类令人叹为观止的操作，这些就属于类型体操。**类型体操绝不代表你的 TS 水平**。如何进一步进阶类型编程能力。[Type Challenge ](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftype-challenges%2Ftype-challenges)是 antfu （Vue 团队成员，以及 Vite、Vitest、Nuxt 等知名开源项目的团队成员或作者）的作品，其中搜集了许多类型编程的题目，并且贴心地按照难易程度分为了 easy、medium、hard 三个等级。务必牢记，Type Challenge 是在已有一定类型编程基础后，用来进一步提高水平的方式，而不是你用来学习类型编程与类型系统的方式

### TypeScript 的工程能力基础

#### 类型声明

```typescript
// 类型检查指令 ts-ignore 与 ts-expect-error
// ts-ignore: 直接禁用掉对下一行代码的类型检查

// @ts-ignore
const name: string = 599;

// ts-expect-error: 它只有在下一行代码真的存在错误时才能被使用，否则它会给出一个错误

// @ts-expect-error
const name: string = 599;

// @ts-expect-error 错误使用此指令，报错
const age: number = 599;

// TypeScript 中也提供了对整个文件生效的类型指令: ts-check 与 ts-nocheck
// @ts-nocheck: 理解为一个作用于整个文件的 ignore 指令，使用了 ts-nocheck 指令的 TS 文件将不再接受类型检查
// @ts-check: 如果希望在 JS 文件中也能享受到类型检查，此时 ts-check 指令就可以登场了,同时还可以使用 @ts-expect-error 指令来忽略掉单行的代码检查


// 类型声明：declare 语法
declare interface Foo {
  prop: string;
}
declare function foo(input: Foo): Foo;
```

这些类型声明就像我们在 TypeScript 中的类型标注一样，会存放着特定的类型信息。除了手动书写这些声明文件，更常见的情况是你的 TypeScript 代码在编译后生成声明文件。

```typescript
// 源代码 index.js
const handler = (input: string): boolean => {
  return input.length > 5;
}
interface Foo {
  name: string;
  age: number;
}

// 编译后会生成一个 .js 文件 和一个 .d.ts 文件，后者就是类型声明文件：
declare const handler: (input: string) => boolean;
interface Foo {
    name: string;
    age: number;
}
```

如果别的文件或是别的项目导入了这段代码，它们就能够从这些类型声明获得对应部分的类型，这也是类型声明的核心作用：**将类型独立于 `.js` 文件进行存储**。别人在使用你的代码时，就能够获得这些额外的类型信息。

#### 让类型定义全面覆盖项目

场景：

1. 想要使用一个npm包，但是它发布的太早，没有携带类型定义，于是你的项目里就出现了这么一处没有被类型覆盖的地方。
2. 当在想在代码里导入一些非代码文件，反正Webpack会帮助我们处理，但是此时TS又会报错。
3. 项目在运行时动态注入了一些全局变量(如`window.errorReporter`)，这是在代码中直接这样访问又会报错。

这时就可以通过**类型声明**来解决：**通过额外的类型声明文件，在核心代码文件以外去提供对类型的进一步补全**。即`.d.ts` 结尾的而文件，它会自动被TS加载到环境中，实现对应部分代码的类型补全。

声明文件中不包含实际的代码逻辑，它只为TypeScript类型检查和推导提供额外的类型信息。

```typescript
// 解决无类型定义的npm包，我们可以通过 declare module 的方式来提供其类型
import foo from 'pkg'; // 无类型定义的npm包
const res = foo.handler();

// 为pkg添加类型提示
declare module 'pkg' {
	const handler: () => boolean;
	export default handler; // 我们也可以在其中使用默认导出
}
import bar from 'pkg';
bar();
```

```typescript
// 处理非代码文件 如：导入一个.md 文件

// index.ts
import raw from './note.md';

const content = raw.replace('NOTE', `NOTE${new Date().getDay()}`);

// declare.d.ts
declare module '*.md' {
  const raw: string;
  export default raw;
}
```

#### `DefinitelyTyped`

`@types/` 开头的这一类 npm 包均属于 [DefinitelyTyped](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2FDefinitelyTyped) ，它是 TypeScript 维护的，专用于为社区存在的**无类型定义的 JavaScript 库**添加类型支持，常见的有 `@types/react` `@types/lodash` 等等。只要你安装了 `@types/react`，TypeScript 会自动将其加载到环境中（实际上所有 `@types/` 下的包都会自动被加载），并作为 react 模块内部 API 的声明。

#### 三斜线指令

作用：**声明当前的文件依赖的其他类型声明**。这里的“其他类型声明”包括了 TS 内置类型声明（`lib.d.ts`）、三方库的类型声明以及你自己提供的类型声明文件等。
注意：**三斜线指令必须被放置在文件的顶部才能生效**。

```typescript
/// <reference path="./other.d.ts" />
/// <reference types="node" />
/// <reference lib="dom" />  声明了对 lib.dom.d.ts 的依赖
```

#### 命名空间

略


















