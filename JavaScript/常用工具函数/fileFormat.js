/*
 * @Description: 这是文件格式化转换工具函数
 * @Date: 2022-02-08 14:12:22
 * @Author: luoshuai
 * @LastEditors: Lewis
 * @LastEditTime: 2022-02-10 23:37:42
 */

/**
 * @description: file转blob
 * @param {*} file/文件
 * @return {*}
 */
 const fileToBlob = (file) => {
    return new Promise((resolve, reject) => {
        // FileReader：https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
        let reader = new FileReader();
        // readAsArrayBuffer：https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsArrayBuffer
        let rs = reader.readAsArrayBuffer(file);
        let blob = null;
        reader.onload = (e) => {
            if (typeof e.target.result === "object") {
                blob = new Blob([e.target.result]);
            } else {
                blob = e.target.result;
            }
            resolve(blob);
        };
        reader.error = () => {
            reject();
        };
    });
}

/**
 * @description: base64转blob
 * @param {*} base64
 * @return {*}
 */
const base64ToBlob = (base64) => {
    const type = base64.split(",")[0].match(/:(.*?);/)[1];
    // base64:https://developer.mozilla.org/zh-CN/docs/Glossary/Base64
    const bytes = window.atob(base64.split(",")[1]);
    // ArrayBuffer: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
    const ab = new ArrayBuffer(bytes.length);
    // Uint8Array:https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
    const ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }
    return new Blob([ab], { type });
}

/**
 * @description: base64转file
 * @param {*} base64
 * @param {*} filename/文件名
 * @return {*}
 */
const base64ToFile = (base64, filename) => {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

/**
 * @description: blob转file
 * @param {*} blob
 * @param {*} filename/文件名
 * @return {*}
 */
const blobToFile = (blob, filename) => {
    // File构造函数：https://developer.mozilla.org/zh-CN/docs/Web/API/File/File
    return new File([blob], filename, { type: blob.type, lastModified: Date.now() });
}

/**
 * @description: blob转URL
 * @param {*} blob
 * @return {*}
 */
const blobToURL = (blob) => {
    // URL.createObjectURL：https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL
    return URL.createObjectURL(blob);
}

module.exports = { fileToBlob, base64ToBlob, base64ToFile, blobToFile, blobToURL };