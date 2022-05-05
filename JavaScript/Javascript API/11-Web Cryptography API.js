/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-05 10:06:00
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-05 10:41:11
 */
/* 

概述：
    Web Cryptography API 描述了一套密码学工具，规范了 JavaScript 如何以安全和符合惯例的方式实现加密。
    这些工具包括生成、使用和应用加密密钥对，加密和解密消息，以及可靠地生成随机数。

    注意：加密接口的组织方式有点奇怪，其外部是一个Crypto对象，内部是一个SubtleCrypto对象。
    在 Web Cryptography API 标准化之前，window.crypto 属性在不同浏览器中的实现差异非常大。
    为实现跨浏览器兼容，标准 API 都暴露在 SubtleCrypto 对象上。
*/

/* 
    关于随机数：
        Math.random()：这个方法在浏览器中是以伪随机数生成器(PRNG)方式实现的。它生成的过程不是真的随机，而只是模拟了随机的特性。
        因为浏览器的生成方式是对其使用了固定的算法，由于算法本身是固定的，如果攻击者知道PRNG的内部状态，就可以预测后续生成的伪随机值。

        为了适用加密计算，密码学安全伪随机数生成器增加了一个熵作为输入，虽然计算速度比PRNG慢了，但是安全性高了可以用于加密。
        Web Cryptography API也引入了CSPRNG，可以通过 crypto.getRandomValues()在全局 Crypto 对象上访问。
*/

const array = new Uint8Array(1);
for (let i = 0; i < 5; ++i) {
    // getRandomValues()会把 随机值 写入作为参数传给它的定型数组。
    // 注意：getRandomValues()最多可以生成 216（65 536）字节，超出则会抛出错误
    console.log(crypto.getRandomValues(array));
}
// Uint8Array [41] 
// Uint8Array [250] 
// Uint8Array [51] 
// Uint8Array [129] 
// Uint8Array [35]

/* 
    SubtleCrypto:
        Web Cryptography API 重头特性都暴露在了 SubtleCrypto 对象上，可以通过 window.crypto.subtle 访问
        这个对象包含一组方法，用于执行常见的密码学功能，如加密、散列、签名和生成密钥。
        因为密码学操作都在原始二进制数据上执行，所以 SubtleCrypto 的每个方法都要用到 ArrayBuffer 和 ArrayBufferView 类型。
        由于字符串是密码学操作的重要应用场景，所以 TextEncoder 和 TextDecoder 是经常和 SubtleCrypto 一起使用的类，用于实现二进制数据与字符串之间的相互转换

    注意：SubtleCrypto 对象只能在安全上下文（https）中使用。

    密码学摘要：
        SHA-1：架构类似 MD5 的散列函数，由于容易收到碰撞攻击因此这个算法已经不再安全
        SHA-2：构建于相同耐碰撞单向压缩函数之上的一套散列函数。这个算法被认为是安全的，广泛应用于很多领域和协议，包括 TLS、PGP 和加密货币（如比特币）。

    CryptoKey 与算法：
        如果没了密钥，那密码学也就没什么意义了。SubtleCrypto 对象使用 CryptoKey 类的实例来生成密钥。
        CryptoKey 类支持多种加密算法，允许控制密钥抽取和使用。

        注意：CryptoKey 支持很多算法，但其中只有部分算法能够用于 SubtleCrypto 的方法。
        要了解哪个方法支持什么算法，可以参考 W3C 网站上 Web Cryptography API 规范的
        “Algorithm Overview”。

*/


/* 
    补充：加密标准的JS库：crypto-js（https://github.com/brix/crypto-js）

*/
