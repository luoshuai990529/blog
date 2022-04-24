/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-24 14:32:32
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-24 14:45:09
 */

/* 
    Encoding API 提供了两种将定型数组转换为字符串的方式：批量解码和流解码。
    与编码器类不同，在将定型数组转换为字符串时，解码器支持非常多的字符串编码
    默认字符编码格式是 UTF-8。
*/

/* 
    1.批量解码
    所谓批量，指的是 JavaScript 引擎会同步解码整个字符串。对于非常长的字符串，可能会花较长时间。
    批量解码是通过 TextDecoder 的实例完成的：
*/
const textDecoder = new TextDecoder();
// 这个实例上有一个 decode()方法，该方法接收一个定型数组参数，返回解码后的字符串
// f 的 UTF-8 编码是 0x66（即十进制 102）
// o 的 UTF-8 编码是 0x6F（即二进制 111）
const encodedText = Uint8Array.of(102, 111, 111);
const decodedText = textDecoder.decode(encodedText);
console.log(decodedText); // foo

// TextDecoder 可以兼容很多字符编码，如 UTF-16
const textDecoder16 = new TextDecoder('utf-16');
const encodedText16 = Uint16Array.of(102, 111, 111);
const decodedText16 = textDecoder.decode(encodedText);
console.log(decodedText16); // foo

/* 
    2.流解码
    TextDecoderStream其实就是 TransformStream 形式的 TextDecoder。
    将编码后的文本流通过管道输入流解码器会得到解码后文本块的流：
*/
async function* chars() {
    // 每个块必须是一个定型数组
    const encodedText = [102, 111, 111].map((x) => Uint8Array.of(x));
    for (let char of encodedText) {
        yield await new Promise((resolve) => setTimeout(resolve, 1000, char));
    }
}
const encodedTextStream = new ReadableStream({
    async start(controller) {
        for await (let chunk of chars()) {
            controller.enqueue(chunk);
        }
        controller.close();
    }
});

const decodedTextStream = encodedTextStream.pipeThrough(new TextDecoderStream());
const readableStreamDefaultReader = decodedTextStream.getReader();
(async function() {
    while(true) { 
        const { done, value } = await readableStreamDefaultReader.read(); 
        if (done) { 
        break; 
        } else { 
        console.log(value); 
        } 
        } 
    }
)(); 
// f 
// o 
// o