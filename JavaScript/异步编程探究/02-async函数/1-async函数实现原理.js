/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-10 12:43:50
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-10 15:41:37
 */

/* 
    async function fn(args) {
        // ...
    }

    // 等同于

    function fn(args) {
        return spawn(function* () {
            // ...
        });
    }
*/

// 下面给出spawn函数的实现，基本就是 ES6入门 Generator 自动执行器的翻版。
function spawn(genF) {
    return new Promise((resolve, reject) => {
        const gen = genF();

        function step(nextF) {
            let next;
            try {
                next = nextF();
            } catch (e) {
                return reject(e);
            }
            if (next.done) {
                return resolve(next.value);
            }
            // next.value 是pending状态 v即完成resolved状态的结果
            Promise.resolve(next.value).then(
                (v) => step(() => gen.next(v)),
                (e) => step(() => gen.throw(e))
            )
        }

        step(() => gen.next(undefined))
    })
}

function getUserInfo() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                username: 'lewis',
                age: 21,
                phone: 10086
            })
        }, 1000)
    })
}

function getUserOrder() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                orderId: 100000000000086
            })
        }, 2000)
    })
}

function fn(args) {
    return spawn(function* () {
        const userInfo = yield getUserInfo()
        console.log("userInfo---", userInfo);
        const userOrder = yield getUserOrder()
        console.log("userOrder---", userOrder);
    });
}

fn()

// 此外还可以参照babelJs对 async函数的转换
// https://babeljs.io/repl#?browsers=&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=MYewdgzgLgBADgRhgXhgBQE4gLYEsICmAdBgRCADYBuBAFAgJQBQokscATCulnoSQQBWBYFFoBaRkyYBDCAE8wwGADMArkqi5wqsDFoMA3kwCQraDFIQ1FWKhkB3GbliYc-YjIoUAygShQFAQAJrQA2ogANPAcALrMZuDkQUQUIADmtFY2UMwAvtIqYAZAA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=false&targets=&version=7.17.6&externalPlugins=&assumptions=%7B%7D