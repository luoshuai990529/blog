/*
 * @Date: 2022-01-31 01:32:37
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-31 23:32:09
 */
/* 
    问题：如何将两个有序列表合并成一个有序的列表？

    思考：
        1-我们可以将两个列表合并成一个列表，然后用到之前的冒泡、选择、插入、希尔...都可以派上用场
    
        如果觉得上述方太过暴力，我们可以换个思路。
        
        2-既然列表已经有序，通过前面的学习，我们知道插入排序的过程中，被插入的数组也是有序的。
        我们可以将其中一个列表中的元素逐个插入到另一个列表中即可

        但是按照这个思路，我们只需要一个列表有序就行了，另一个列表不管是不是有序的，都会被逐个取出，
        插入第一个列表中。那么，在两个列表都有序的情况下，还有更优的合并方案吗？

        深入思考后，可以发现，在第二个列表向第一个列表逐个插入的过程中，由于第二个列表已经有序，所以
        后续插入的元素一定不会在前面插入的元素之前。在逐个插入的过程中，每次插入时，只需要从上次插入
        的位置开始，继续向后寻找插入位置即可。这样的话，我们最多只需要将两个有序数组遍历一次就可以完成合并

        问题：在向数组不断插入新数字时，原数组需要不断的腾出位置，这是一个比较复杂的过程，而且这个过程
        必然导致增加一轮遍历。
        
        替代方案：只要开辟一个长度等同于两个数组长度之和的新数组，并使用两个指针来遍历原有的两个数组，
        不断的将较小的数字添加到新数组中，并移动对应的指针即可。

*/

// 根据以上思路，我们可以写出合并两个有序列表的代码：
function merge(arr1, arr2) {
    const result = new Array(arr1.length + arr2.length);
    let index1 = 0,
        index2 = 0;
    while (index1 < arr1.length && index2 < arr2.length) {
        // console.log(`arr1中的值 ${arr1[index1]} arr2中的值 ${arr2[index2]}`);
        if (arr1[index1] <= arr2[index2]) {
            // 如果有序列表1当前指针的指到的元素 小于等于 有序列表2指针指到的元素
            // 就将有序列表1中的这个值插入到 result 数组中当前下标对应的位置 即 index1 + index2
            result[index1 + index2] = arr1[index1];
            index1++;
        } else {
            // 反之，则将有序列表2中的值插入到 result 数组中当前下标对应的位置 即 index1 + index2
            result[index1 + index2] = arr2[index2];
            index2++;
        }
    }

    // 经过上述遍历插入数组后，发现还会有一个序列剩余数字没有插入合适位置，我们还需要将剩余数字补到结果数组之后
    while (index1 < arr1.length) {
        result[index1 + index2] = arr1[index1];
        index1++;
    }
    while (index2 < arr2.length) {
        result[index1 + index2] = arr2[index2];
        index2++;
    }
    console.log("result--", JSON.stringify(result));
}
const list1 = [1, 3, 5, 7, 9];
const list2 = [2, 4, 6, 8, 10];
// merge(list1, list2);

/* 
    合并有序数组的问题解决了，但是我们排序时用的都是无序数组，那么上哪里去找这两个有序数组呢？

    答案——自己拆分，我们可以把数组不断的拆分成两份，直到只剩下一个数字时，这一个数字组成的数组，我们
    就可以认为它是有序的。

    然后通过上述合并有序列表的思路，将1个数字组成的有序数组合并成一个包含2个数字的有序数组，
    再将两个数字组成的有序数组合并成包含4个数字的有序数组....直到整个数组排序完成，这就是归并排序的思想。
*/

/* 
    将数组拆分成有序数组：
        拆分过程使用了二分的思想，这是一个递归的过程，归并排序使用的递归框架如下：

    function startMergeSort(arr){
        if (arr.length === 0) {
            return
        }
        const result = mergeSort(arr, 0, arr.length - 1)
        // 将结果拷贝到 arr 数组中
        for (let i=0; i < result.length; i++ ){
            arr[i] = result[i]
        }
    }

    function mergeSort(arr, start, end){
        // 只剩下一个数字，停止拆分，返回单个数字组成的数组
        if(start === end){
            return Array.of(arr[start])
        }
        const middle = (start+end) / 2;
        // 拆分左边区域
        const left = mergeSort(arr, start, middle);
        // 拆分右边区域
        const right = mergeSort(arr, middle+1, end);
        // 合并左右区域
        return merge(left, right)
    }

    其中 startMergeSort(arr) 是对外暴露的公共方法，内部调用了私有的 mergeSort(arr,start,end)函数，
    这个函数用于对arr的[start,end]区间进行归并排序

    可以看到，我们在这个函数中，将原有的数组不断地二分，直到只剩下最后一个数字。此时嵌套的递归开始返回，
    一层层的调用merge(arr1,arr2)函数，也就是我们刚才写的将两个有序数组合并为一个有序数组的函数。

    这就是最经典的归并排序，只需要一个二分拆数组的递归函数和一个合并两个有序列表的函数即可。
    但这份代码还有一个缺点，那就是在递归的过程中，开辟了很多临时空间，接下来我们可以减少临时空间的开闭 做一些优化。
    
*/

/* 
    归并排序的优化：减少临时空间的开辟
    
    为了减少在递归过程中不断开辟空间的问题，我们可以再归并排序之前，先开辟出一个临时空间，
    在递归过程中统一使用此空间进行归并即可。

    下列代码中，我们统一使用result数组作为递归过程的临时数组，所以merge函数接收的参数不再是两个数组，
    而是 result 数组中需要合并的两个数组的首尾下标。根据首尾下标就可以分别计算出两个有序数组的首尾下标
    start1、end1、start2、end2，之后饿过程就和之前合并两个有序数组的代码类似了。

    function startMergeSort(arr) {
        if (arr.length === 0) {
            return;
        }
        const result = new Array(arr.length);
        const start = 0;
        const end = arr.length - 1;
        mergeSort(arr, start, end, result);
    }

    // 对 arr 的 [start, end] 区间归并排序
    function mergeSort(arr, start, end, result) {
        // 只剩下一个数字，停止拆分
        if (start === end) {
            return;
        }
        const middle = parseInt((start + end) / 2);
        // 拆分左边区域，并将归并排序的结果保存到result 的 [start, middle] 区间
        mergeSort(arr, start, middle, result);
        // 拆分右边区域，并将归并排序的结果保存到result 的 [middle+1, end] 区间
        mergeSort(arr, middle + 1, end);
        // 合并左右区域到 result 的 [start, end] 区间
        merge(arr, start, end, result);
    }

    function merge(arr, start, end, result) {
        const middle = parseInt((start + end) / 2);
        // 数组1的首尾位置
        let start1 = start;
        let end1 = middle;
        // 数组2的首尾位置
        let start2 = middle + 1;
        let end2 = end;
        // 用来遍历数组的指针
        let index1 = start1;
        let index2 = start2;
        // 结果数组的指针
        let resultIndex = start1;
        
        // ....
    }
*/

// 最终的归并代码如下
function startMergeSort(arr) {
    if (arr.length === 0) {
        return;
    }
    const result = new Array(arr.length);
    mergeSort(arr, 0, arr.length - 1, result);
    console.log("result---", result);
}

function mergeSort(arr, start, end, result) {
    // 只剩下一个数字，停止拆分
    if (start === end) {
        return;
    }
    const middle = parseInt((start + end) / 2);
    // 拆分左边区域，并将归并排序的结果保存到 result 的 [start, middle] 区间
    mergeSort(arr, start, middle, result);
    // 拆分右边区域，并将归并排序的结果保存到 result 的 [middle+1, end] 区间
    mergeSort(arr, middle + 1, end, result);
    // 合并左右区域到 result 的 [start, end] 区间
    mergeHandler(arr, start, end, result);
}

function mergeHandler(arr, start, end, result) {
    const middle = parseInt((start + end) / 2);
    // 数组1的首尾位置
    let start1 = start;
    let end1 = middle;
    // 数组2的首尾位置
    let start2 = middle + 1;
    let end2 = end;
    // 用来遍历数组的指针
    let index1 = start1;
    let index2 = start2;
    // 结果数组的指针
    let resultIndex = start1;
    // console.log(`列表1的首尾位置${start1}-${end1} 列表2的首尾位置${start2}-${end2} 结果数组的指针 ${resultIndex}`);
    while (index1 <= end1 && index2 <= end2) {
        if (arr[index1] <= arr[index2]) {
            result[resultIndex++] = arr[index1++];
        } else {
            result[resultIndex++] = arr[index2++];
        }
    }
    // console.log(`01-插入结果：`, result);
    // 将剩余数字补到结果数组之后
    while (index1 <= end1) {
        result[resultIndex++] = arr[index1++];
    }
    while (index2 <= end2) {
        result[resultIndex++] = arr[index2++];
    }
    // console.log(`02-将剩余数字补充到最后的结果：`, result);
    // 将 result 操作区间的数字拷贝到 arr 数组中，以便下次比较
    // while (start <= end) {
    //     arr[start] = result[start++];
    // }
    for (let i = start; i <= end; i++) {
        arr[i] = result[i];
    }
}
const arr = [4, 2, 8, 6, 0];
startMergeSort(arr);

/* 
    小结：
        其实现在的归并排序看起来仍然 “美中不足”，那就仍然需要开辟额外的空间，其实我们可以做到不开辟额外的空间实现归并排序
        我们称之为原地归并排序。

        （PS：因为我脑子不够用了 这里就不分析这个原地排序了。。。😵 代码放在下面）

        时间复杂度：O(nlogn) 拆分数组的过程中，会将数组拆分成 logn次，每层执行的比较层数都约等于n次，所以时间复杂度是O(nlogn)
        空间复杂度：O(n) 主要占用空间的就是我们在排序前创建的长度为n的result数组
        
        归并排序分为两步：
            1-拆分数组
            2-合并数组
        它是分治思想的典型应用。分治思想的意思是“分而治之”，分的时候体现了二分的思想，
        治是一个滚雪球的过程，将1个数字组成的有序数组合并成一个包含2个数字的有序数组，再将2个数字组成的有序数组合并成
        包含4个数字的有序数组....

        由于性能较好，且排序稳定，归并排序应用非常广泛，Java的 sort源码中 的TimSort就是归并排序的优化版( 不必过多纠结 )
*/

// 原地排序实现：
function startInplaceMergeSort(arr) {
    if (arr.length === 0) {
        return;
    }
    const result = new Array(arr.length);
    mergeSort(arr, 0, arr.length - 1, result);
    console.log("原地排序 结果 result---", result);
}

function inplaceMergeSort(arr, start, end, result) {
    // 只剩下一个数字，停止拆分
    if (start === end) {
        return;
    }
    const middle = parseInt((start + end) / 2);
    // 拆分左边区域，并将归并排序的结果保存到 result 的 [start, middle] 区间
    inplaceMergeSort(arr, start, middle);
    // 拆分右边区域，并将归并排序的结果保存到 result 的 [middle+1, end] 区间
    inplaceMergeSort(arr, middle + 1, end);
    // 合并左右区域到 result 的 [start, end] 区间
    mergeHandler2(arr, start, end);
}

function mergeHandler2(arr, start, end) {
    let end1 = parseInt((start + end) / 2);
    let start2 = end1 + 1;
    // 用来遍历数组的指针
    let index1 = start;
    let index2 = start2;
    while (index1 <= end1 && index2 <= end) {
        if (arr[index1] <= arr[index2]) {
            index1++;
        } else {
            // 右边区域的这个数字比左边区域的数字小，于是它站了起来
            let value = arr[index2];
            let index = index2;
            // 前面的数字不断地后移
            while (index > index1) {
                arr[index] = arr[index - 1];
                index--;
            }
            // 这个数字坐到 index1 所在的位置上
            arr[index] = value;
            // 更新所有下标，使其前进一格
            index1++;
            index2++;
            end1++;
        }
    }
}

let testList = [7, 4, 2, 6, 1, 0];
startInplaceMergeSort(testList)
