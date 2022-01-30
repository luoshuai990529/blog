/*
 * @Date: 2022-01-30 19:22:37
 * @LastEditors: Lewis
 * @LastEditTime: 2022-01-31 01:02:50
 */

/* 
    快速排序算法由 C.A.R Hoare在1960年提出。它的时间复杂度也是O(n log n),但他在时间复杂度为O(nlogn)级的几种算法中
    大多数情况西夏效率更高，所以快速排序的应用非常广泛。再加上快速排序所采用的分治思想非常实用，使得快速排序深受面试官青睐，
    所以掌握快速排序的思想尤为重要。

    快速排序的基本思想：
        1-从数组中取出一个数，称之为基数(pivot)
        2-遍历数组，将比基数大的数字都放到它右边，比基数小的数字放到它的左边。遍历完成后，数组被分成了左右两个区域
        3-将左右两个区域视为两个数组，重复前两个步骤，直到排序完成

        事实上，快速排序的每一次遍历，都将基数摆到了最终位置上。
        第一轮遍历排好 1个基数，
        第二轮遍历排好 2个基数（每个区域一个基数，但是如果某个区域为空，则此轮只能排好一个基数），
        第三轮遍历排好 4个基数（同理，最差的情况下，只能排好一个基数），
        以此类推，总遍历次数为 log n ~ n次，每轮遍历的时间复杂度为O(n),
        所以很容易分析出快速排序的时间复杂度为 O(nlogn) ~ O(n^2),平均时间复杂度为 O(nlogn)。

*/

/* 
    快速排序基本递归框架：

    function startQuickSort(arr) {
        quickSort(arr, 0, arr.length - 1);
    }

    function quickSort(arr, start, end) {
        // 将数组分区，并获得中间值的下标
        const middle = partition(arr, start, end);
        // 对左边区域快速排序
        quickSort(arr, start, middle - 1);
        // 对右边区域快速排序
        quickSort(arr, middle + 1, end);
    }

    function partition(arr, start, end) {
        // TODO：将 arr 从 start到end分区，左边区域比基数小，右边区域比基数大
    }

    position意为“划分”，我们期望 partition 函数做的事情是：将arr从start到end这一区间的值分成两个区域，
    左边区域的每个数都比基数小，右边区域的每个数都比基数大，然后返回中间值的下标。

    只要有了这个函数，我们就能写出快速排序的递归函数框架。首先调用partition函数得到中间值的下标middle，
    然后对左边区域执行快速排序，也就是递归调用 quickSort(arr, start, middle-1),再对右边区域执行快速排序，
    也就是递归调用quickSort(arr, middle + 1, end)。
*/

/* 
    退出递归的边界条件
    很容易想到，当某个区域只剩下一个数字的时候，自然不需要排序了，此时退出递归。实际上还有一种情况，
    就是某个区域只剩下0个数字时，也需要退出递归函数。当middle等于start或者end时，就会出现某个区域剩余数字为0。

    *此时可以修改quickSort函数如下：
    function quickSort(arr, start, end){
        // 将数组分区 并获得中间值的下标
        const middle = partition(arr, start, end)
        // 当左边区域至少有两个数字时，对左边区域进行快排
        if(start != middle && start != middle - 1) quickSort(arr, start, middle-1);
        // 当右边区域至少有两个数字时，对右边区域进行快排
        if(middle != end && middle != end - 1) quickSort(arr, middle + 1, end);
    }
    在递归之前，先判断此区域剩余数字是否为0个或1个，当数字至少为2个时，才执行这个区域的快速排序。
    因为我们知道 middle >= start && middle <= end 必然成立，所以判断剩余区域的数字为0个或者1个也就是
    指start或end 与 middle相等或者相差 1。

    分析下列四个判断条件：
        1-当 start == middle 时，相当于 quickSort(arr, start, middle - 1) 中的start == end + 1
        2-当 start == middle-1 时，相当于 quickSort(arr, start, middle - 1) 中的start == end
        3-当 middle == end 时，相当于 quickSort(arr, middle + 1, end) 中的 start == end + 1
        4-当 middle == end-1时，相当于 quickSort(arr, middle + 1, end) 中的 start == end

    *通过以上条件，我们可以将此边界条件移到quickSort函数之前：
    function quickSort(arr, start, end){
        // 如果区域内的数字少于2个，退出递归
        // if(start === end || start === end + 1) return;
        // 由上面所说的 middle >= start && middle <= end 可以推断出，
        // 除了 start === end || start === end + 1 这两个条件以外，其他情况下start都小于end，因此这个条件可以再次简写
        if(start >= end) return;  // 实际上只有两种情况，start==end（表示区域内只有一个数字） start = end + 1（表示区域内一个数字也没有）
        
        const middle = partition(arr, start, end);
        quickSort(arr, start, middle - 1);
        quickSort(arr, middle + 1, end);
    }
*/

/* 
    分区算法实现：
        快速排序中最重要的就是 分区算法，也就是 partition 函数。主要问题就在于分区时存在各种边界条件。

        上文已经说到，partition函数需要做的事情就是将arr 从start 到 end 分区，左边区域比基数小，右边区域比基数大，
        然后返回中间值的下标。那么首先我们要做的事情就是选择一个基数，我们一般称之为pivot，意为 "轴"。
        整个数组就像围绕这个轴进行旋转，小于轴的数字旋转到左边，大于轴的数组旋转到右边。
        （所谓双轴快排就是一次性选择两个基数，将数组分为三个区域进行旋转，关于双轴快排将在后续了解）
*/

/* 
    基数的选择(通常没有固定标准，随意选择区间任何一个数字作为基数都可以)：
        1-选择第一个元素作为基数
        2-选择最后一个元素作为基数
        3-选择区间内一个随机元素作为基数
    选择的基数不同，算法的实现也不同。实际上第三种选择方式的平均时间复杂度是最优的，之后详细了解
*/

// 这里我们通过第一种方式来了解快速排序
// function partition(arr, start, end) {
//     // 取第一个数为基数
//     const pivot = arr[start];
//     // 从第二个数开始分区
//     const left = start + 1;
//     // 右边界
//     const right = end;
// }
/* 
    分区的方式有很多种，最简单的思路是：从left开始，遇到比基数大的数就交换到数组最后，并将right减一，
    直到left和right相遇，此时数组就被分成左右两个区域。再将基数和中间的数交换，返回中间值的下标即可。
*/

const { swap } = require("./swap");
function startQuickSort(arr) {
    quickSort(arr, 0, arr.length - 1);
}
function quickSort(arr, start, end) {
    // 如果区域内的数字少于 2 个，退出递归
    if (start >= end) return; // 实际上只有两种情况，start==end（表示区域内只有一个数字） start = end + 1（表示区域内一个数字也没有）
    // 将数组分区，并获得中间值的下标
    const middle = partition(arr, start, end);
    // 对左边区域快速排序
    quickSort(arr, start, middle - 1);
    // 对右边区域快速排序
    quickSort(arr, middle + 1, end);
}
// 将 arr 从 start 到 end 区分,左边区域比基数小,右边区域比基数大,然后返回中间值的下标。
// function partition(arr, start, end) {
//     // 取第一个数为基数
//     const pivot = arr[start];
//     // 从第二个数开始分区
//     let left = start + 1;
//     // 右边界
//     let right = end;
//     console.log("基数pivot:", pivot);
//     // left、right 相遇时退出循环
//     while (left < right) {
//         // 找到第一个大于基数的位置
//         while (left < right && arr[left] <= pivot) left++;
//         // 交换这两个数，使得左边分区都小于或等于基数，右边分区大于或等于基数
//         if (left != right) {
//             swap(arr, left, right);
//             right--;
//         }
//     }

//     // 如果 left 和 right 相等，单独比较 arr[right] 和 pivot
//     if (left === right && arr[right] > pivot) right--;
//     // 将基数和中间数交换
//     if (right !== start) swap(arr, start, right);
//     // 返回中间值的下标
//     return right;
// }
const list = [6, 5, 4, 3, 2, 1];
startQuickSort(list);
console.log("result---",list);

/* 
    小结：
        因为我们选择了第一个元素作为基数，并且区分完后，会执行将基数和中间值交换的操作，这就意味着交换后的中间值会被分到左边区域。
        所以我们需要保证中间值得下标是分区完成后，最后一个比基数小的值，这里我们用right来记录这个值。

        细节：在交换left和right之前，我们判断了 left != right,这是因为如果剩余的数组都比基数小，
        则left会加到right才停止，这时不应该发生交换。因为right已经指向了最后一个比基数小的值。

        但这里的拦截可能会拦截到一种错误的情况，如果剩余的数组只有最后一个数比基数大，left仍然加到right停止了，
        但我们并没有发生交换。所以我们在退出循环后，单独比较了 arr[right] 和 pivot

        实际上，这行单独比较的代码非常巧妙，一共处理了三种情况：
            · 一是刚才提到的剩余数组中只有最后一个数比基数大的情况
            · 二是left和right区间内只有一个值，则初始状态下，left === right，所以 while(left < right)根本不会进入，
            所以此时我们单独比较这个值和基数的大小关系
            · 三是剩余数组中每个数都比基数大，此时right会持续减小，知道和left相等退出循环，此时left所在位置的值还没有和
            pivot进行比较，所以我们单独比较left所在位置的值和基数的大小关系。

*/

/* 
    双指针分区算法：
        除了上述的分区算法外，还有一种双指针分区的算法更为常用：从left开始，遇到比基数大的数，记录其下标；
        再从right往前遍历，找到第一个比基数小的数，记录其下标；然后交换这两个数。继续遍历，知道left和right相遇。
        然后就和上述算法一样了，交换基数和中间值，并返回中间值的下标
*/

function partition(arr, start, end) {
    // 取第一个数为基数
    const pivot = arr[start];
    // 从第二个数开始分区
    let left = start + 1;
    // 右边界
    let right = end;
    console.log("基数pivot:", pivot);
    // left、right 相遇时退出循环
    while (left < right) {
        // 找到第一个大于基数的位置
        while (left < right && arr[left] <= pivot) left++;
        // 找到第一个小于基数的位置
        while (left < right && arr[right] >= pivot) right--;
        // 交换这两个数，使得左边分区都小于或等于基数，右边分区大于或等于基数
        if (left != right) {
            swap(arr, left, right);
            left++;
            right--;
        }
    }

    // 如果 left 和 right 相等，单独比较 arr[right] 和 pivot
    if (left === right && arr[right] > pivot) right--;
    // 将基数和轴交换
    swap(arr, start, right)
    // 返回中间值的下标
    return right;
}

/* 
    小结：
        从代码中可以分析出，快速排序是一种不稳定的排序算法，在分区过程中，相同数的相对顺序可能会被修改

        时间复杂度：平均时间复杂度为 O(nlogn) ,最坏的时间复杂度为 O(n^2),
        空间复杂度：和递归的层数相关，每层递归会生成一些临时变量，所以空间复杂度为 O(logn)~O(n),平均复杂度为O(logn)
        
        问题：为什么说随机选择剩余数组中的一个元素作为基数的方案平均复杂度是最优的呢？
        我们可以先看一下什么情况下的快速排序算法的时间复杂度最高，一共两种情况：
            1-数组为正序 [1,2,3,4,5,6]
            2-数组为倒序 [6,5,4,3,2,1]
        当数组原本为正序或逆序时，我们将第一个数作为基数的话，时间复杂度达到了O(n^2),既然数组已经有序了为什么还需要对其排序呢？
        实际工作中这种重复排序的需求也是比较常见。

        如：有一个场景，前端程序员从第三方平台提供的接口中获取一列数据，并且产品部门要求前端必须保证这一列数据在展示给用户时是有序的。
        在测试环境下，前端程序员发现从第三方平台获取到的数据总是有序的，为了保险起见，还是得对收到的数据再次排序。因为第三方平台提供的
        数据是不可控的，所以不能选择相信后台，以防哪一天它提供的数据变成了无序，于是这里就会发生重复排序的问题，就会影响到程序性能。

        解决思路：只要我们每轮选择的基数不是剩余数组中最大或者最小的值就可以了。具体方案常见的有三种：
            1.每轮选择基数时，从剩余的数组中随机选择一个数字作为基数。这样每轮都选到最大或最小值得概率就变低了。
            所以我们才说用这种方式选择基数，其平均时间复杂度是最优的。
            2.还有一种解决方案，既然数组重复排序的情况如此常见，那么我们可以在快速排序之前先对数组做个判断，如果已经有序则直接返回，如果是逆序则直接倒序即可。
            在 Java 内部封装的 Arrays.sort() 的源码中就采用了此解决方案。
            3.在排序之前，先用洗牌算法将数组的原有顺序打乱，以防止原数组正序或者逆序。
                Java中 集合类中有一个方法已经封装了 洗牌算法 Collections.shuffle()函数，此处就略了。。。。（😵我表示我脑子已经炸裂了）
*/