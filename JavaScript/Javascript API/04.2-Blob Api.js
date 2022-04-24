/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-24 15:33:34
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-24 16:03:42
 */


/* 
    某些情况下，可能需要读取部分文件而不是整个文件。为此，File 对象提供了一个名为 slice()的方法。
    slice方法接收两个参数：1-起始字节 和 2-要读取的字节数
    这个方法返回一个Blob的实例，而Blob实际上是File的超类。

    Blob表示 二进制大对象 ，是JS对不可修改二进制数据的封装类型。
    包含字符串的数组、ArrayBuffers、ArrayBufferViews，甚至其他Blob都可以用来创建blob。
    Blob构造函数接收一个options参数，并在其中指定MIME类型：

*/
console.log(new Blob(['foo']));
// Blob {size: 3, type: ""}
console.log(new Blob(['{"a": "b"}'], { type: 'application/json' }));
// {size: 10, type: "application/json"} 
console.log(new Blob(['<p>Foo</p>', '<p>Bar</p>'], { type: 'text/html' }));
// {size: 20, type: "text/html"}

/* 
    Blob 对象有一个size属性和一个type属性，还有一个slice()方法用于进一步切分数据。（只读取部分文件可以节省时间，特别是在只需要数据特定部分比如文件头的时候。）
    另外也可以使用FileReader从Blob中读取数据。
    例：只读取文件的前32字节
*/
// let filesList = document.getElementById("files-list");
// filesList.addEventListener("change", (event) => {
//     let output = document.querySelector(".output"),
//         files = event.target.files,
//         reader = new FileReader(),
//         blob = new Blob(files).slice(0, 32);
//     if (blob) {
//         reader.readAsText(blob);
//         reader.onerror = function () {
//             output.innerHTML = "Could not read file, error code is " +
//                 reader.error.code;
//         };
//         reader.onload = function () {
//             output.innerHTML = reader.result;
//         };
//     } else {
//         console.log("Your browser doesn't support slice().");
//     }
// });

/* 
    对象URL 和 Blob：
        对象URL有时候也称作Blob URL，是指引用存储在File或Blob中数据的URL。
        对象URL的优点是：不用把文件内容读取到Javascript也可以使用文件。
        创建对象URL：window.URL.createObjectURL() 传入File或者Blob对象。返回值是一个指向 内存中地址的字符串。
        因为这个字符串是URL，所以可以再DOM中直接使用。
    例：使用对象URL再页面中显示一张图片

    注意：使用完数据之后，最好能释放与之关联的内存。只要对象 URL 在使用中，就不能释放内存。
    如果想表明不再使用某个对象 URL，则可以把它传给 window.URL.revokeObjectURL()。
    页面卸载时，所有对象 URL 占用的内存都会被释放。
*/
let filesList = document.getElementById("files-list");
filesList.addEventListener("change", (event) => {
    let output = document.querySelector(".output"),
        files = event.target.files,
        url = window.URL.createObjectURL(files[0]); // blob:http://127.0.0.1:5501/3397b3ec-e371-4e83-96ef-c05e0e7e5a49
    if (url) {
        if (/image/.test(files[0].type)) {
            output.innerHTML = `<img src="${url}">`;
        } else {
            output.innerHTML = "Not an image.";
        }
    } else {
        output.innerHTML = "Your browser doesn't support object URLs.";
    }
});


