/*
 * @Date: 2022-01-27 22:22:17
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-28 20:16:28
 */

/* 
    冒泡排序
        时间复杂度：O(n^2)
        空间复杂度：O(1)
    三种写法：
        1. 一边比较一边向后两两交换，将最大值/最小值冒泡到最后一位
        2. 经过优化的写法：使用一个变量记录当前轮次的比较是否发生过交换，如果没有发生交换则表示已经有序，不再继续排序
        3. 进一步的优化写法：除了使用变量记录当前轮次是否发生过交换外，再用一个变量记录上次发生交换的位置，下一轮排序时到达上次交换的位置就停止比较。
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

/**
 * @description: 冒泡排序方法1
 * @param {Array}
 * @return {*}
 */
const bubbleSort1 = (arr) => {
    let compareCount = 0; // 比较次数
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
            compareCount++;
            if (arr[j] > arr[j + 1]) {
                // 如果左边的数大于右边的数，则交换，保证右边的数字最大
                swap(arr, j, j + 1);
            }
        }
    }
    console.log("bubbleSort1 比较次数：", compareCount);
};

// 要排序的数组
let list = [1, 2, 3, 4, 6, 5, 7, 8];
bubbleSort1(list);
console.log("result1-", JSON.stringify(list));

/**
 * @description: 优化冒泡排序方法2
 * @param {*} arr
 * @return {*}
 */
const bubbleSort2 = (arr) => {
    // 通过一个变量来判断当前的一轮比较是否发生过交换，如果没有发生交换，则表示剩下的数字都是有序的了，可以停止排序
    let compareCount = 0; // 比较次数
    let orderly = false;
    for (let i = 0; i < arr.length - 1; i++) {
        if (orderly) {
            // console.log("剩下的都是有序数字，停止比较");
            break;
        }
        orderly = true;
        for (let j = 0; j < arr.length - 1 - i; j++) {
            compareCount++;
            if (arr[j] > arr[j + 1]) {
                // 如果左边的数大于右边的数，则交换，保证右边的数字最大
                swap(arr, j, j + 1);
                orderly = false;
            }
        }
    }
    console.log("bubbleSort2 比较次数：", compareCount);
};
let list2 = [1, 2, 3, 4, 6, 5, 7, 8];
bubbleSort2(list2);
console.log("result2-", JSON.stringify(list2));

/**
 * @description: 优化冒泡排序方法3
 * @param {*} arr
 * @return {*}
 */
const bubbleSort3 = (arr) => {
    // 通过一个变量来判断当前的一轮比较是否发生过交换，如果没有发生交换，则表示剩下的数字都是有序的了，可以停止排序
    let compareCount = 0; // 比较次数
    let orderly = false; // 是否已排序
    let swappedIndex = -1; // 上次发生交换的位置
    let indexOfLastUnsortedElement = arr.length - 1; // 最后一个没有经过排序的数的下标
    while (!orderly) {
        orderly = true;
        for (let i = 0; i < indexOfLastUnsortedElement; i++) {
            compareCount++;
            if (arr[i] > arr[i + 1]) {
                // 如果左边的数大于右边的数，则交换，保证右边的数字最大
                swap(arr, i, i + 1);
                // 表示发生了交换
                orderly = false;
                // 更新交换的位置
                swappedIndex = i;
            }
        }
        // 最后一个没有经过排序的元素的下标就是最后一次发生交换的位置‘
        indexOfLastUnsortedElement = swappedIndex;
    }
    console.log("bubbleSort3 比较次数：", compareCount);
};
let list3 = [1, 2, 3, 4, 6, 5, 7, 8];
bubbleSort3(list3);
console.log("result3-", JSON.stringify(list3));
