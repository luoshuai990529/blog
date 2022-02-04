/*
 * @Date: 2022-02-01 00:02:24
 * @LastEditors: Lewis
 * @LastEditTime: 2022-02-04 20:42:16
 */

/* 
    O(n) 级的排序算法存在已久，但是他们只能用于特定的场景。
    计数排序就是一种时间复杂度为O(n)的排序算法
    在对一定范围内的整数排序时，它的复杂度为O(n+k)

    例：我们需要对一列数组排序，这个数组中每个元素都是 [1,9] 区间内的整数。
    那么我们可以构建一个长度为9的数组用于计数，数组的下标分别对应这区间内的整数。
    然后遍历待排序的数组，将区间内的每个整数出现的次数统计到计数数组中对应下标的位置。
    最后遍历计数数组，将每个元素输出
*/

/**
 * @description: 计数排序01
 * @param {Array} arr 排序的数组
 * @param {Number} m 区间范围 0-m 的整数
 * @return {*}
 */
function countingSort(arr, m) {
    // 建立长度为m的数组
    const countingList = new Array(m).fill(0);
    // 遍历arr中的每个元素
    for (const element of arr) {
        // 将每个整数出现的次数统计到计数数组中对应下标的位置
        countingList[element - 1]++;
    }
    let index = 0;
    // console.log("countingList-", JSON.stringify(countingList));
    // 遍历计数数组，将每个元素输出
    for (let i = 0; i < m; i++) {
        // 输出的次数就是对应位置记录的次数
        while (countingList[i] !== 0) {
            arr[index++] = i + 1;
            countingList[i]--;
        }
    }
}
const list = [3, 2, 1, 5, 6, 9];
countingSort(list, 9);
console.log("result-", list);

/**
 * @description: 计数排序2.0 上面的实现中，arr中记录的元素已经不再是开始的那个元素了，他们只是值相等，却不是同一个对象
 * @param {Array} arr 排序的数组
 * @param {Number} m 区间范围 0-m 的整数
 * @return {*}
 */
function countingSort2(arr, m) {
    // 建立长度为 m 的数组
    const countingList = new Array(m).fill(0);
    // 记录每个下标中包含的真是元素，使用队列可以保证排序的稳定性(这里使用map中存数组来做)
    const map = new Map();

    // 遍历 arr 中的每个元素
    for (const element of arr) {
        // 将每个整数出现的次数统计到计数数组中对应下标的位置
        countingList[element - 1]++;
        if (!map.has(element - 1)) {
            map.set(element - 1, new Array());
        }
        map.get(element - 1).push(element);
    }
    // console.log("map--", map);
    // console.log("countingList--", JSON.stringify(countingList));

    let index = 0;
    // 遍历计数数组，将每个元素输出
    for (let i = 0; i < 9; i++) {
        // 输出的次数就是对应位置记录的次数
        while (countingList[i] !== 0) {
            // 输出记录的真实元素
            arr[index++] = map.get(i)[0];
            map.delete(i);
            countingList[i]--;
        }
    }
}
const list2 = [3, 2, 1, 5, 6, 9];
countingSort2(list2, 9);
console.log("result2 - ", list2);

/**
 * @description: 真正的计数排序，不是把数组的下标直接作为结果输出，
 * 而是通过计数的结果，计算每个元素在排序完成后的位置，然后将元素赋值到对应的位置上
 * @param {Array} arr 排序的数组
 * @param {Number} m 区间范围 0-m 的整数
 * @return {*}
 */
function countingSort3(arr) {
    // 判空和防止数组越界
    if (arr === null || arr.length <= 1) return;
    // 找到最大值，最小值
    let max = arr[0];
    let min = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
        if (arr[i] < min) {
            min = arr[i];
        }
    }

    // 确定计数范围
    const range = max - min + 1;
    // 建立长度为range的数组，下标 0~range-1 对应数字 min~max
    const countingList = new Array(range).fill(0);

    // 遍历arr中的每个元素
    for (const element of arr) {
        // 将每个整数出现的次数统计到计数数组中对应下标的位置
        countingList[element - min]++;
    }

    // 记录前面比自己小的数字的总和
    let preMinCountsSum = 0;
    for (let i = 0; i < range; i++) {
        // 当前的数字比下一个数字小，累计到 preMinCountsSum
        preMinCountsSum += countingList[i];
        // 将countingList 计算成当前数字在结果中的起始下标位置 位置 = 前面比自己小的数字 总和。
        countingList[i] = preMinCountsSum - countingList[i];
    }
    // console.log("countingList-", countingList);
    // console.log("preMinCountsSum-", preMinCountsSum);

    const result = new Array(arr.length);
    for (const element of arr) {
        // countingList[element - min] 表示此元素在结果数组中的下标
        result[countingList[element - min]] = element;
        // 更新 countingList[element- min],指向此元素的下一个下标
        countingList[element - min]++;
    }

    // 将结果赋值回 arr
    for (let i = 0; i < arr.length; i++) {
        arr[i] = result[i];
    }
}
const list3 = [3, 2, 1, 5, 6, 9];
countingSort3(list3);
console.log("result3 - ", list3);

/* 
    小结：
        时间复杂度：O(n+k) k表示数据的范围大小
        空间复杂度：O(n+k) 用到的空间主要长度是k的计数数组和长度为 n 的结果数组

    计数排序是一种稳定的排序算法。

    计数排序只适用于数据范围不大的场景，因为计数排序的常数项可能是非常大的数，大到至于我们无法忽略 如一个 2^31 次方的数组
    因此计数排序可以在对考试成绩排序时就比较合适，如果需要在排序中的数字中存在一位小数，可以将所有数字乘10，再去计算下标。

    计数排序和 O(nlogn) 级排序算法的本质区别：
        从决策树的角度来理解：https://leetcode-cn.com/leetbook/read/sort-algorithms/ozyo63/
            得出下列定理：
                1-《算法导论》定理 8.1：在最坏情况下，任何比较排序算法都需要做 O(n \log n)O(nlogn) 次比较。
                2-《算法导论》推论 8.2：堆排序和归并排序都是渐进最优的比较排序算法。
            结论：如果基于比较来进行排序，无论怎么优化都无法突破O(nlogn)的下界。计数排序和基于比较的排序算法相比，
            根本区别就在于：它不是基于比较的排序算法，而是利用了数字本身的属性来进行排序。
        
        从概率的角度来理解(联想二分法)：
            计数排序时申请了长度为k的计数数组，在遍历每一个数字时，这个数字落在计数数组中的可能性共有 k 种，
            但通过数字本身的大小属性，我们可以 一次 把它放在正确的位置上。相当于一次排除了 (k-1)/k 可能性
*/
