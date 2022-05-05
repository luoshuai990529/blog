/*
 * @Description: 这是***页面（组件）
 * @Date: 2022-05-05 14:04:30
 * @Author: luoshuai
 * @LastEditors: luoshuai
 * @LastEditTime: 2022-05-05 14:10:51
 */

/* 
    encodeURIComponent() 和 encodeURI()
        相同点：都是对给定字符串中的所有内容进行编码
        不同点：
            encodeURIComponent的不转义字符：A-Z a-z 0-9 - _ . ! ~ * ' ( )
            encodeURI的不转义字符：A-Z a-z 0-9 ; , / ? : @ & = + $ - _ . ! ~ * ' ( ) #
            因此如果要编码的字符串只是 URL 的一部分，则应使用 encodeURIComponent
            如果要编码的字符串是完整 URL，则应使用 encodeURI
*/
const partOfURL = 'my-page#with,speci@l&/"characters"?';
const fullURL = 'https://my-website.com/my-page?query="a%b"&user=1';

console.log(encodeURIComponent(partOfURL)); // Good, escapes special characters
// 'my-page%23with%2Cspeci%40l%26%2F%22characters%22%3F'

console.log(encodeURIComponent(fullURL));  // Bad, encoded URL is not valid
// 'https%3A%2F%2Fmy-website.com%2Fmy-page%3Fquery%3D%22a%25b%22%26user%3D1'


const partOfURL1 = 'my-page#with,speci@l&/"characters"?';
const fullURL1 = 'https://my-website.com/my-page?query="a%b"&user=1';

console.log(encodeURI(partOfURL1)); // Bad, does not escape all special characters
// 'my-page#with,speci@l&/%22characters%22?'

console.log(encodeURI(fullURL1));  // Good, encoded URL is valid
// 'https://my-website.com/my-page?query=%22this%25thing%22&user=1'