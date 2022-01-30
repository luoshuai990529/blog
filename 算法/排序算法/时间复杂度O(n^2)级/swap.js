/*
 * @Date: 2022-01-29 12:22:35
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-29 12:27:23
 */
/**
 * @description: 交换元素
 * @param {Array} arr
 * @param {Number} i
 * @param {Number} j
 * @return {*}
 */
const swap = (arr, i, j) => {
    /* 
        方法一：通过一个中间变量来完成交换
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    */

    /* 
        方法二： 在不引入中间变量的情况下,通过位运算(异或 代码用 ^ 表示)完成交换
        arr[i] = arr[i] ^ arr[j];
        arr[j] = arr[j] ^ arr[i];
        arr[i] = arr[i] ^ arr[j];

        补充：
          ^异或的运算规则：对于每个二进制数，当两个数对应的位相同的时候 结果位0，否则结果位1
          将一个十进制数count转成二进制：count.toString(2)
          将二进制数count解析成十进制：  parseInt(count,2)

        举例释义：现有数组 list = [1,2,3,4]
        list[0] = list[0] ^ list[3] 等价于=> 1 ^ 4 二进制描述 => 001 ^ 100 => 101 解析成十进制 => 5 此时的数组排列： [5, 2, 3, 4]
        list[3] = list[3] ^ list[0] 等价于=> 4 ^ 5 二进制描述 => 100 ^ 101 => 001 解析成十进制 => 1 此时的数组排列： [5, 2, 3, 1]
        list[0] = list[0] ^ list[3] 等价于=> 5 ^ 1 二进制描述 => 101 ^ 001 => 100 解析成十进制 => 4 此时的数组排列： [4, 2, 3, 1]

        至此，在不通过中间变量的情况下完成两个数的交换
    */

    // 方法三： 在不引入中间变量的情况加下,利用ES6的解构语法
    [arr[i], arr[j]] = [arr[j], arr[i]];
};

exports.swap = swap