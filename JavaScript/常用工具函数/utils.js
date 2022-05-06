/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-05 16:41:18
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-06 16:27:14
 */

/**
 * @description: 返回当前URL的参数对象
 * @param {String} url
 * @return {Object}
 */
const getURLParameters = url => (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
    (a, v) => (
        (a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a
    ),
    {}
);

/**
 * @description: 拼接链接参数
 * @param {*} url 链接
 * @param {*} params 参数名称
 * @return {*}
 */
function formatUrl(url, params) {
    const curryParams = getURLParameters(url)
    const originParams = {...curryParams, ...params}
    const paramStr = Object.keys(originParams).filter(item => originParams[item] !== '').map((item) => `${item}=${originParams[item]}`).join('&');
    return paramStr !== '' ? `${url.split('?')[0]}?${paramStr}` : `${url.split('?')[0]}`;
}

/**
 * @description: 加载script
 * @param {*} src 文件路径
 * @param {*} cb 加载后的回调
 * @return {*}
 */
function loadScript(src, cb) {
    const head = document.head || document.getElementsByTagName("head")[0];
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    cb = cb || function () { };

    if (!("onload" in script)) {
        script.onreadystatechange = function () {
            if (this.readyState !== "complete" && this.readyState !== "loaded") return;
            this.onreadystatechange = null;
            cb(script);
        };
    }
    script.onload = function () {
        this.onload = null;
        cb(script);
    };
    head.appendChild(script);
}