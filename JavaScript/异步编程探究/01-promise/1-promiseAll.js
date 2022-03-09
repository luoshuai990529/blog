/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-03 15:32:31
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-03-09 17:41:02
 */
const getUserInfo = () => {
    console.log("getUserInfo START");
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                payload: {
                    name: 'zs'
                }
            })
        }, 2000)
    })
}

const getUserOrder = () => {
    console.log("getUserOrder START");
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                payload: {
                    orderId: 10086
                }
            })
        }, 2000)
    })
}

// 改造前
async function fn1() {
    console.log("fn1 start");
    const { payload: userInfo } = await getUserInfo()
    const { payload: userOrder } = await getUserOrder()
    console.log("userInfo:", userInfo);
    console.log("userOrder:", userOrder);
}
// fn1()

// 改造后
async function fn2() {
    console.log("fn2 start");
    const [userInfo, userOrder] = await Promise.all([
        Promise.resolve().then(() => getUserInfo()),
        Promise.resolve().then(() => getUserOrder())
    ])
    console.log("userInfo:", userInfo); 
    console.log("userOrder:", userOrder); 
    /* 
        fn2 start
        getUserInfo START
        getUserOrder START
        userInfo: { code: 200, payload: { name: 'zs' } }
        userOrder: { code: 200, payload: { orderId: 10086 } }
    */
}
fn2()