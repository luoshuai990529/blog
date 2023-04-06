function timeout(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

class SuperTask {
    // 实现相关代码....

    constructor(limitCount = 2) {
        this.limitCount = limitCount; // 限制总并发数
        this.currentRunTask = 0; // 当前正在运行的任务数
        this.tasks = [] // 任务队列
    }

    add(task) {
        return new Promise((resolve, reject) => {
            // 将任务添加到任务队列
            this.tasks.push({
                resolve,
                reject,
                task
            })
            this._run()
        })
    }

    _run() {
        while (this.limitCount > this.currentRunTask && this.tasks.length !== 0) {
            // 如果当前运行的任务 少于 并发数限制，则取出任务运行
            const { task, resolve, reject } = this.tasks.shift()
            this.currentRunTask++;
            task().then(resolve, reject).finally(() => {
                // 任务运行结束 重新唤起_run方法
                this.currentRunTask--;
                this._run()
            })
        }
    }
}
const superTask = new SuperTask()

function addTask(time, name) {
    superTask
        .add(() => timeout(time))
        .then(() => {
            console.log(`任务 ${name} 完成`)
        })
}


/* 
    addTask(10000, 1) // 10000ms 后输出：任务1完成 
    addTask(50000, 2) // 50000ms 后输出：任务2完成 
    addTask(30000, 3) // 80000ms 后输出：任务3完成 
    addTask(40000, 4) // 12000ms 后输出：任务4完成 
    addTask(50000, 5) // 15000ms 后输出：任务5完成 

    通过上述运行结果我们可以知道 一次最多同时执行2个异步任务，只要其中一个任务完成了，那么将剩余任务队列中的任务取出进行执行
*/

// addTask(10000, 1)
// addTask(5000, 2)
// addTask(3000, 3)
// addTask(4000, 4)
// addTask(5000, 5)
addTask(1000, 1)
addTask(1000, 2)
addTask(1000, 3)
addTask(1000, 4)
addTask(1000, 5)