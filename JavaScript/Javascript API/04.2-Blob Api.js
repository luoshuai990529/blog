/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-24 15:33:34
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-17 18:42:44
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
// let filesList = document.getElementById("files-list");
// filesList.addEventListener("change", (event) => {
//     let output = document.querySelector(".output"),
//         files = event.target.files,
//         url = window.URL.createObjectURL(files[0]); // blob:http://127.0.0.1:5501/3397b3ec-e371-4e83-96ef-c05e0e7e5a49
//     if (url) {
//         if (/image/.test(files[0].type)) {
//             output.innerHTML = `<img src="${url}">`;
//         } else {
//             output.innerHTML = "Not an image.";
//         }
//     } else {
//         output.innerHTML = "Your browser doesn't support object URLs.";
//     }
// });

/* 
    通过读取文件的魔数来正确判断文件的类型：

    在实际工作中，遇到的文件类型是多种多样的，针对这种情形，你可以使用现成的第三库来实现文件检测的功能,如：https://github.com/sindresorhus/file-type#readme
*/
let filesList = document.getElementById("files-list");
filesList.addEventListener("change", async (event) => {
    let output = document.querySelector(".output"), files = event.target.files
    try {
        const { mime } = await getImageType(files[0])
        const url = window.URL.createObjectURL(files[0]);
        output.innerHTML = `<img src="${url}"> <p>${mime} 类型</p>`;
    } catch (error) {
        output.innerHTML = error.msg;
    }
});

function getImageType(file) {
    function check(headers) {
        return (buffers, options = { offset: 0 }) => headers.every((header, index) => header === buffers[options.offset + index]);
    }
    return new Promise((resolve, reject) => {
        readBuffer(file, 0, 8).then(res => {

            const uint8Array = new Uint8Array(res)
            const FileHeaderMap = new Map([
                ['png', { header: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mime: 'image/png', ext: 'png', checkFn: check }],
                ['jpg', { header: [0xff, 0xd8, 0xff], mime: 'image/jpg', ext: 'jpg', checkFn: check }],
                ['gif', { header: [0x47, 0x49, 0x46], mime: 'image/gif', ext: 'gif', checkFn: check }],
                ['bmp', { header: [0x42, 0x4d], mime: 'image/bmp', ext: 'bmp', checkFn: check }],
                ['webp', { header: [82, 73, 70, 70], mime: 'image/webp', ext: 'webp', checkFn: check }]
            ])
            for (const { header, mime, ext, checkFn, options } of FileHeaderMap.values()) {
                console.log("校验：", ext);
                if (checkFn(header, options)(uint8Array)) {
                    resolve({ mime, ext })
                    return
                }
            }
            reject({ msg: '未找到该对应图片类型', TypedArray: JSON.stringify(uint8Array) })
        }).catch((err) => {
            reject({ ...err, msg: JSON.stringify(err) })
        })
    })
}

function readBuffer(file, start = 0, end = 2) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file.slice(start, end));
    });
}





