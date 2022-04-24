/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-04-24 14:45:54
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-04-24 15:33:18
 */
/* 
    Web应用程序的一个主要的痛点是无法操作用户计算机上的文件。
    File API和Blob API是为了让Web开发者能以安全的方式访问客户端机器上的文件，从而更好的进行交互和设计。
*/

/* 
    File API 仍然以表单中的文件输入字段为基础，但是增加了直接访问文件信息的能力。
    每个 File 对象都有一些只读属性：
        name：本地系统中的文件名
        size：以字节计的文件大小
        type：包含文件MIME类型的字符串
        lastModifiedDate：标识文件最后修改时间的字符串（Chome支持）
*/

/* 
    FileReader 类型：表示一种异步文件读取机制。
        可以把FileReader想象成类似于 XMLHttpRequest，只不过是用于从文件系统读取文件，而不是从服务器读取数据。
        FileReader类型提供了几个读取文件数据的方法：
            readAsText(file, encoding): 从文件中读取纯文本内容并保存在reasult属性中。第二参数表示编码，是可选的。
            readAsDataURL(file): 读取文件并将 内容的数据URI 保存在result属性中。
            readAsBinaryString(file): 读取文件并将 每个字符的二进制数据 保存在result属性中。
            readAsArrayBuffer(file): 读取文件并将 文件内容以ArrayBuffer形式 保存在result属性中。
            这几个方法提升了处理文件数据的灵活性：
                为了向用户显示图片，可以将图片读取为数据 URI，而为了解析文件内容，可以将文件读取为文本。
            因为上述方法是异步的，所以每个FileReader会发布几个事件，其中3个最有用的事件是：progress、error、load 分别表示：还有更多数据、发生了错误、读取完成。
                progress：每50毫秒触发一次，在progress事件中可以读取FileReader和result属性，即使其中尚未包含全部数据。
                error：由于某种原因无法读取文件时触发；error属性会包含一个code值：1-未找到文件、2-安全错误、3-读取被中断、4-文件不可读、5-编码错误
                load：文件加载成功后触发。

    下面代码从表单字段中读取一个文件，并将其内容显示在网页上。
    如果文件的MIME类型表示它是一个图片，那么就将其读取后保存为数据URI，在load事件触发时将数据URI作为图片插入页面中。
    如果文件不是图片，则读取后将其保存为文本并原样输出到网页上。
    progress 事件用于跟踪和显示读取文件的进度，而 error 事件用于监控错误。

    如果想提前结束文件读取，则可以在过程中调用 abort()方法，从而触发 abort 事件。
    在 load、error 和 abort 事件触发后，还会触发 loadend 事件。
    FileReader.abort()：该方法可以取消 FileReader 的读取操作
*/

const filesList = document.querySelector('#files-list');
filesList.addEventListener('change', (event) => {
    let output = document.querySelector('.output');
    let progress = document.querySelector('.progress');
    let reader = new FileReader();
    let files = event.target.files;
    let type = 'default';

    console.log("files[0]-", files[0]);
    if (/image/.test(files[0].type)) {
        reader.readAsDataURL(files[0]);
        type = "image";
    } else {
        reader.readAsText(files[0]);
        type = "text";
    }

    reader.onerror = function () {
        output.innerHTML = "Could not read file, error code is " +
            reader.error.code;
    };

    reader.onprogress = function (event) {
        console.log("onprogress-", event.lengthComputable);
        if (event.lengthComputable) {
            progress.innerHTML = `${event.loaded}/${event.total}`;
        }
    }

    reader.onload = function () {
        let html = '';
        switch (type) {
            case 'image':
                html = `<img src="${reader.result}">`;
                break;
            case "text":
                html = reader.result;
                break;
        }
        output.innerHTML = html;
    }
})

/* 
    FileReaderSync 类型：
        FileReader 的同步版本。这个类型拥有与 FileReader相同的方法，只有在整个文件都加载到内存之后才会继续执行。
        FileReaderSync 只在工作线程中可用，因为如果读取整个文件耗时太长则会影响全局。
*/

