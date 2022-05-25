/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-05 16:41:18
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-20 15:11:16
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
    const originParams = { ...curryParams, ...params }
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

/* 
    我们了解了装饰函数，它是 JavaScript 中独特的装饰者模式。
    在写一些函数时如果是稳定且方便移植的功能，我们可以通过装饰着模式去添加一些个性化功能。
    
    Function.prototype.before 接受一个函数当作参数，这个函数即为新添加的函数，它装载了新添加的功能代码。
*/
Function.prototype.before = function (beforefn) {
    var __self = this; // 保存原函数的引用
    return function () { // 返回包含了原函数和新函数的"代理"函数
        beforefn.apply(this, arguments); // 执行新函数，且保证 this 不被劫持，新函数接受的参数
        // 也会被原封不动地传入原函数，新函数在原函数之前执行
        return __self.apply(this, arguments); // 执行原函数并返回原函数的执行结果，
        // 并且保证 this 不被劫持
    }
}
/* 
    Function.prototype.after 的原理跟 Function.prototype.before 一模一样，
    唯一不同的地方在于让新添加的函数在原函数执行之后再执行。
*/
Function.prototype.after = function (afterfn) {
    var __self = this;
    return function () {
        var ret = __self.apply(this, arguments);
        afterfn.apply(this, arguments);
        return ret;
    }
};