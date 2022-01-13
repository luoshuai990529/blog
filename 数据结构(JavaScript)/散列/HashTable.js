/*
 * @Date: 2022-01-11 22:39:45
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-13 22:56:10
 */

/* 
    我们使用一个类来表示散列表，该类包括计算散列值的方法、向散列中插入数据的方法、从散列表中读取数据的方法、显示散列表中数据分布的方法....
*/

class HashTable {
    constructor() {
        this.table = new Array(137);
    }

    put(data) {
        let pos = this.simpleHsh(data);
        //  得到索引后 将数据存储到对应索引位置上
        this.table[pos] = data;
    }

    simpleHsh(data) {
        /* 
                        散列函数的选择依赖于键值的数据类型。如果键是整数，最简单的散列函数就是以数组的长度对键取余
                        在一些情况下，比如数组的长度是10，而键值都是10的倍数时，就不推荐使用这种方式了。
                        这也是数组的长度为什么要是质数的原因之一，就像我们在上面将数组的长度设定为137一样。
                        如果键是随机的整数，则散列函数应该更均匀的分布这些键。这种散列方式称为 除留余数法
                    */
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            // ASCII 字符集支持 128 种字符(阿拉伯数字、大小写英文、符号...)。
            // Unicode：是一种字符集(将世界上所有的符号都纳入其中,依然兼容 ASCII，即 0～127 意义依然不变。)。
            // UTF-8：是 Unicode 字符集的一种编码方案。

            // charCodeAt() 方法返回 0 到 65535 之间的整数，表示给定索引处的 UTF-16 代码单元值
            // 通过对data每个字符的 UTF-16 代码单元 累加
            total += data.charCodeAt(i);
        }
        console.log("Hash value: " + data + " -> " + total);
        //  最后得到散列表对应的索引(累加值 除 散列表的长度 的余数)
        return total % this.table.length;
    }

    showDistro() {
        for (let i = 0; i < this.table.length; i++) {
            if (this.table[i] != undefined) {
                console.log(`i : ${JSON.stringify(this.table[i])}`);
            }
        }
    }
}
