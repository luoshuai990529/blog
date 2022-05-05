/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-05 16:41:18
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-05 16:48:53
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