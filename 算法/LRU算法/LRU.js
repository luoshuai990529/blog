/*
 * @Description: LRUCache
 * @Date: 2022-05-07 17:26:46
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-08 14:56:59
 */

/* 
    Map.prototype.keys()返回一个引用的Iterator对象
    那么我们可以直接取用线程的迭代器获取下一个节点的key值 keys().next()

*/
class LRUCache {
    constructor(max) {
        this.max = max; // 容量
        this.cache = new Map(); // 缓存队列
    }

    get(key) {
        if (this.cache.has(key)) { // 如果缓存队列中有这个key
            const temp = this.cache.get(key);
            // 访问到的 key 若在缓存中，将其提前
            this.cache.delete(key);
            this.cache.set(key, temp)
            return temp;
        }
        return -1
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            // 存在则删除，if 结束再提前
        } else if (this.cache.size >= this.max) {
            // 超过缓存长度，就淘汰最近没有使用的
            const deleteKey = this.cache.keys().next().value;
            this.cache.delete(deleteKey);

            console.log(`refresh: key:${key}, value:${value}`);
        }
        this.cache.set(key, value)
    }
    toString() {
        // console.log('max:', this.max)
        console.table(this.cache)
    }
}


const list = new LRUCache(4);
list.put(1, 'Lewis');
list.put(2, 'Jacky');
list.put(3, 'Mark');
list.put(4, 'Tom'); // 已满：从头至尾 Lewis => Jacky => Mark => Tom
list.toString()
list.get(1); //  获取key1 将Lewis插入队首：Jacky => Mark => Tom => Lewis
list.put(5, 'Pitter'); // 超出容量删除队尾：Mark => Tom => Lewis => Pitter
list.toString()

























