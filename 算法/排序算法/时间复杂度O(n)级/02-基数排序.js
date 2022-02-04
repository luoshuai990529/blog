/*
 * @Date: 2022-02-04 20:43:12
 * @LastEditors: Lewis
 * @LastEditTime: 2022-02-04 23:04:08
 */

/* 
    我们如何对日期进行排序？如对 2014 年 1 月 7 日，2020 年 1 月 9 日，2020 年 7 月 10 日 进行排序
    
    思考过程大致是：
        1-先看年份，2014 比 2020 要小，所以 2014 年这个日期应该放在其他两个日期前面。
        2-另外两个日期年份相等，所以我们比较一下月份，1 比 7 要小，所以 1 月这个日期应该放在 7 月这个日期前面

    这种利用多关键字进行排序的思想就是基数排序，和计数排序一样，这也是一种线性时间复杂度的排序算法。
    其中的每个关键字都被称作一个基数。

    基数排序有两种实现方式：
        1-最高位优先法( MSD (Most significant digital) ) 思路是从最高位开始，依次对基数进行排序。 
            例：如我们对 999, 997, 866, 666999,997,866,666 这四个数字进行基数排序
                思路：
                    01-先看第一位基数：6 比 8 小，8 比 9 小，所以 666 是最小的数字，866 是第二小的数字，暂时无法确定两个以 99 开头的数字的大小关系
                    02-再比较 9 开头的两个数字，看他们第二位基数：9 和 9 相等，暂时无法确定他们的大小关系
                    03-再比较 99 开头的两个数字，看他们的第三位基数：7 比 9 小，所以 997 小于 999
        2-最低位优先法( LSD (Least significant digital) ) 思路是从最低位开始，依次对基数进行排序。使用 LSD 必须保证对基数进行排序的过程是稳定的。

    通常来说 LSD 比 MSD 更加常用。
        差异处：
            MSD在比较两个数字时，其他基数开头的数字不得不放到一边，体现在计算机中 这里就会产生很多临时变量
            但在采用 LSD 进行基数排序时，每一轮遍历都可以将所有数字一视同仁，统一处理。

    基数排序分为以下三个步骤：
        1-找出数组中最大的数字的位数 maxDigitLength
        2-获取数组中每个数字的基数
        3-遍历 maxDigitLength 轮数组，每轮按照基数对其进行排序

*/

/**
 * @description: LSD 方式的基数排序
 * @param {*} arr
 * @return {*}
 */
function radixSort(arr) {
    if (!arr) {
        return;
    }

    // 找出最大值
    let max = 0;
    for (const value of arr) {
        if (value > max) {
            max = value;
        }
    }
    // 计算最大数字的长度
    let maxDigitLength = 0;
    while (max != 0) {
        maxDigitLength++;
        max = parseInt(max / 10);
    }

    // 使用计数排序算法对基数进行排序
    const countingList = new Array(10).fill(0);
    const result = new Array(arr.length).fill(0);
    let dev = 1;

    for (let i = 0; i < maxDigitLength; i++) {
        for (const value of arr) {
            const radix = parseInt(value / dev) % 10;
            // console.log("radix---", radix);
            countingList[radix]++;
        }
        for (let j = 1; j < countingList.length; j++) {
            countingList[j] += countingList[j - 1];
        }
        // console.log("countingList--", countingList);
        // 使用倒序遍历的方式完成计数排序
        for (let j = arr.length - 1; j >= 0; j--) {
            const radix = parseInt(arr[j] / dev) % 10;
            console.log("radix==", radix);
            result[--countingList[radix]] = arr[j];
        }

        // 计数排序完成后，将结果拷贝回 arr 数组
        // arr = [...result]; // 直接在这里修改不会影响到外面的arr
        for (let i = 0; i < arr.length; i++) {
            arr[i] = result[i]            
        }
        // 将计数数组重置为0
        // 当每一轮对基数完成排序后，我们将 result 数组的值拷贝回 arr 数组，并且将 counting 数组中的元素都置为 0，以便在下一轮中复用。
        countingList.fill(0);
        dev *= 10;
    }
}

const list = [668, 996, 994, 776, 99];
radixSort(list);
console.log("result -", list);

/* 
    小结：
        上面的代码只实现了LSD一种，其余的就略了，脑子不够使了
        
        无论是 LSD 还是 MSD 基数排序都需要经历 maxDigitLength 轮遍历

        时间复杂度：O(d(n+k))  d 表示最长数字的位数，k 表示每个基数可能的取值范围大小,如果是对非负整数排序，则 k = 10，如果是对包含负数的数组排序，则 k = 19。
        空间复杂度：O(n+k)  和计数排序一样
*/