type BanType<T, E> = T extends E ? never : T;

// 除了Date类型 其他类型都可以接收
function log<T>(val: BanType<T, Date>) {
	console.log(val);
}

// log(new Date()); // 类型报错
log(123);
log('hello');
