/*
 * @Date: 2022-03-06 20:23:28
 * @LastEditors: Lewis
 * @LastEditTime: 2022-03-06 20:48:06
 */

/* 
    Generator 函数和 Promise 的结合
        使用 Generator 函数管理流程，遇到异步操作时，通常返回一个promise对象

*/

function getFoo() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("foo");
        }, 1000);
    });
}

function getBoo() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("boo");
        }, 1000);
    });
}


const g = function* () {
    try {
        const foo = yield getFoo();
        const boo = yield getBoo();
        console.log("g- foo", foo);
        console.log("g- boo", boo);
    } catch (error) {
        console.log("error-", error);
    }
};

function run(generator){
    const it = generator();
    function go(result){
        if (result.done) return result.value;

        return result.value.then((value) => {
            return go(it.next(value));
        }, (error) => {
            return go(it.throw(error))
        })
    }

    go(it.next());
}

run(g);
