/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-03-07 09:57:39
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-05 16:38:38
 */

/**
 * @description: 返回字符串的长度（以字节为单位）
 * @param {String} str 字符串
 * @return {*} 字节数
 */
const byteSize = str => new Blob([str]).size;

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
 * @description: 获取当前除参数以外的的URL
 * @param {String} url
 * @return {String} baseUrl
 */
const getBaseURL = url => url.replace(/[?#].*$/, '');


/**
 * @description: 重定向URL
 * @param {String} url
 * @param {Boolean} asLink
 * @return {*}
 */
const redirect = (url, asLink = true) =>
    asLink ? (window.location.href = url) : window.location.replace(url);

/**
 * @description: 检查URL是否同源
 * @param {*} origin
 * @param {*} destination
 * @return {*}
 */
const isSameOrigin = (origin, destination) =>
    origin.protocol === destination.protocol && origin.host === destination.host;

/**
 * @description: 组合函数 （从右往左执行）
 * @param {Function} fns
 * @return {Function}
 */
const compose = (...fns) =>
    fns.reduce((f, g) => (...args) => f(g(...args)));

/**
 * @description: 柯里化函数
 * @param {Function} fn 被柯里化的函数
 * @param {Number} arity 当要柯里化一个接受可变数量参数的函数，就可以传入此参数，当提供的参数足够就会执行函数
 * @param {array} args
 * @return {*}
 */
const curry = (fn, arity = fn.length, ...args) =>
    arity <= args.length ? fn(...args) : curry.bind(null, fn, arity, ...args);