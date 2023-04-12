const cat = {
	name: 'Lily',
	age: 18,
	variety: 'orange cat',
};

const phone = {
	name: 'apple',
	price: 8848,
};

function getValue(obj: object, key: string) {
	return obj[key];
}
console.log(getValue(cat, 'name')); // TS类型推断是 any

function getValue2<T extends object, K extends keyof T>(obj: T, key: K) {
	return obj[key];
}
console.log(getValue2(cat, 'name')); // TS能给出正确的类型推断
// console.log(getValue2(phone, 'variety')); // 类型报错
