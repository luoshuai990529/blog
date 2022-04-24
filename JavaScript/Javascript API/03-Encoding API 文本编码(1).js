/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-21 20:49:27
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-24 14:31:51
 */


/* 
    Encoding API 主要用于实现字符串与定型数组之间的转换。
    规范新增了4个用于执行转换的全局类：TextEncoder、TextEncoderStream、TextDecoder 和 TextDecoderStream。
        
        Encoding API 提供了两种将字符串转换为定型数组二进制格式的方法：
            1.批量编码
            2.流编码
        把字符串转换为定型数组时，编码器始终使用UTF-8。
    
    注意：相比于批量（bulk）的编解码，对流（stream）编解码的支持很有限。
*/

/* 
    1.批量编码
        所谓批量，指的是JavaScript引擎会同步编码整个字符串。对于非常长的字符串，可能会花较长时间。
        批量编码是通过TextEncoder的实例完成的。

*/
const textEncoder = new TextEncoder();
// 这个实例上有一个encode() 方法，该方法接收一个字符串参数，并Unit8Array 格式返回每个字符串的UTF-8编码：
const decodedText1 = 'abc';
const encodedText = textEncoder.encode(decodedText1);
console.log(encodedText) //  Uint8Array(3) [ 97, 98, 99 ]

// 编码器是用于处理字符串的，有些字符串(如表情符号)在最终返回的数组中可能会占多个索引：
const decodedText2 = '🙄';
const encodedText2 = textEncoder.encode(decodedText2);
console.log(encodedText2); // Uint8Array(4) [ 240, 159, 153, 132 ]

/* 
    编码器实例还有一个encodeInto()方法，该方法接收一个 字符串 和 目标Unit8Array ，返回一个字典，该字典包含了 read 和 written 属性，
    分别表示成功从源字符串读取了多少字符和向目标数组写入了多少字符。如果定型数组的空间不够，编码就会提前终止，返回的字典会体现这个结果：
        
    encode()要求分配一个新的 Unit8Array，encodeInto()则不需要。对于追求性能的应用，这个差别可能会带来显著不同。

    注意：文本编码会始终使用 UTF-8 格式，而且必须写入 Unit8Array 实例。使用其他类型数组会导致 encodeInto()抛出错误。
*/
const fooArr = new Uint8Array(3);
const barArr = new Uint8Array(2);
const fooResult = textEncoder.encodeInto('foo', fooArr);
const barResult = textEncoder.encodeInto('bar', barArr);

console.log("fooArr：", fooArr); // Uint8Array(3) [ 102, 111, 111 ]
console.log("fooResult：", fooResult); // { read: 3, written: 3 } 表示从'foo'中读取了3个字符向目标数组中写入了3个字符
console.log("barArr", barArr); // Uint8Array(2) [ 98, 97 ]
console.log("barResult", barResult); // { read: 2, written: 2 } 表示从'bar'中读取了2个字符向目标数组中写入了2个字符

/* 
    流编码：
        TextEncoderStream其实就是TransformStream形式的 TextEncoder。
        将 解码后的文本流 通过管道输入 流编码器 会得到 编码后文本块的流。
    
    ReadableStream: ReadableStream 接口呈现了一个可读取的二进制流操作。
    ReadableStream的 pipeThrough: 提供了一种可链接的方式，用于通过转换流或任何其他可写/可读对来管道传输当前流。
    getReader: 方法创建一个读取器，并将流锁定到该读取器。当流被锁定时，在释放此读取器之前，无法获取其他读取器。
*/
async function* charts() {
    const decodedText = 'foo'
    for (let char of decodedText) {
        yield await new Promise((resolve) => setTimeout(resolve, 1000, char))
    }
}

const decodedTextStream = new ReadableStream({
    async start(controller) {
        for await (let chunk of charts()) {
            controller.enqueue(chunk)
        }
        controller.close()
    }
})

const encodedTextStream = decodedTextStream.pipeThrough(new TextEncoderStream())

const readableStreamDefaultReader = encodedTextStream.getReader();

(async function () {
    while (true) {
        const { done, value } = await readableStreamDefaultReader.read();
        if (done) {
            break;
        } else {
            console.log(value);
        }
    }
})()
// Uint8Array[102] 
// Uint8Array[111] 
// Uint8Array[111]


