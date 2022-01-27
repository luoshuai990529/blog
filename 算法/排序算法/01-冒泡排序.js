/*
 * @Date: 2022-01-27 22:22:17
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-27 23:37:23
 */

/* 
    冒泡排序的三种写法
    1. 一边比较一边向后两两交换，将最大值/最小值冒泡到最后一位
    2. 经过优化的写法：使用一个变量记录当前轮次的比较是否发生过交换，如果没有发生交换则表示已经有序，不再继续排序
    3. 进一步的优化写法：除了使用变量记录当前轮次是否发生过交换外，再用一个变量记录上次发生交换的位置，下一轮排序时到达上次交换的位置就停止比较。
*/

// 要排序的数组
const list = [9, 7, 23, 0, -8, 1, 44, -2];

/**
 * @description: 交换元素
 * @param {Array} arr
 * @param {Number} i
 * @param {Number} j
 * @return {*}
 */
const swap = (arr, i, j) => {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
};

/**
 * @description: 冒泡排序方法1
 * @param {Array}
 * @return {*}
 */
const bubbleSort1 = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                // 如果左边的数大于右边的数，则交换，保证右边的数字最大
                swap(arr, j, j + 1);
            }
        }
    }
};
bubbleSort1(list);
console.log("result-", list);
