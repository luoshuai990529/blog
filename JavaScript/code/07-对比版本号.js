function* walk(version) {
    let str = ''
    const signs = ['.']
    for (let i = 0; i < version.length; i++) {
        if (signs.includes(version[i])) {
            yield str
            str = ''
        } else {
            str += version[i]
        }
    }

    if (str) {
        yield str
    }

}

function compareVersion(version1, version2) {

    const generator2 = walk(version2)
    for (const val1 of walk(version1)) {
        const val2 = generator2.next().value
        console.log("generator =>", val1, val2);
        if (val1 < val2) {
            // generator2.next()
            return -1
        }
        if (val1 > val2) {
            return 1
        }
    }

    if (version2.length > version1.length && generator2.next().value > 0) {
        return -1
    }

    return 0
}


console.log(compareVersion('0.1', '1.1.1')); // 返回-1
console.log(compareVersion('13.37', '1.2 ')); // 返回1
console.log(compareVersion('1.1', '1.1.0')); // 返回0
console.log(compareVersion('1.1', '1.1.1')); // 返回-1