/*
 * @Date: 2022-01-29 12:02:50
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-29 21:06:57
 */

const { swap } = require("./swap");

/* 
    生活中有一个很常见的场景：在打扑克牌的时候，我们一边抓牌一边给扑克牌排序，每次摸一张牌，
    就将它插入手上已有的牌中合适的位置，逐渐完成整个排序。

    插入排序：
        交换法：在新数字插入过程中，不断与前面的数字交换，直到找到自己合适的位置。
        移动法：在新数字插入过程中，与前面的数字不断比较，前面的数字不断向后挪出位置，当新数字找到自己的位置后，插入一次即可
    
    时间复杂度：O(n^2) 空间复杂度O(1)


    注：插入排序的过程不会破坏原有数组中相同关键字的相对次序，所以插入排序是一种稳定的排序算法。
*/

const insertSort1 = (arr) => {
    // 从第二个数开始，往前插入数字
    for (let i = 1; i < arr.length; i++) {
        let j = i;
        while (j >= 1 && arr[j] < arr[j - 1]) {
            console.log(
                `j:${j} 当前的数：${arr[j]} 和前面的数${arr[j - 1]} 替换位置`
            );
            swap(arr, j, j - 1);
            // 更新当前数字下标
            j--;
        }
    }

    /*  小结：
            当数字少于两个时，不存在排序问题，当然也不需要插入，所以我们直接从第二个数字开始往前插入。
        整个过程就像时已经有一些数字坐成了一排，这时一个新的数字要加入，这个新加入的数字原本坐在最后一位
        然后它不断地与前面的数字比较，如果前面的数字比它大，它就和前面的数字交换位置。
    */
};
const list1 = [4, 2, 1, 3, 6, 5];
insertSort1(list1);
console.log("result--", JSON.stringify(list1));

const insertSort2 = (arr) => {
    // 从第二个数开始，往前插入数字
    for (let i = 1; i < arr.length; i++) {
        const currentNumber = arr[i];
        let j = i - 1;
        // 寻找插入位置的过程，不断的将比 currentNumber 大的数字向后挪
        while (j >= 0 && currentNumber < arr[j]) {
            arr[j + 1] = arr[j];
            // console.log(`比${currentNumber}大的数字：${arr[j]},将${arr[j]}后移一位 当前的j：${j}` );
            j--;
        }

        // 两种情况会跳出循环：
        // 1.遇到一个小于或等于 currentNumber的数字，跳出循环，currentNumber 就坐在它后面。
        // 2.已经走到数列头部,仍然没有遇到小于或者等于 currentNumber的数字,也会跳出循环,此时 j 等于 -1,currentNumber就坐到数列头部。
        arr[j + 1] = currentNumber;

        // console.log(`将${currentNumber}插入到位置${j+1} 第${i}轮比较结束：`, JSON.stringify(arr));
    }
};
const list2 = [4, 2, 1, 3, 6, 5];
insertSort2(list2);
console.log("result--", JSON.stringify(list2));
