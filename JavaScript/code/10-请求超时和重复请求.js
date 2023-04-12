function requestLoop(url, maxCount = 5) {
    return fetch(url).catch((err) => maxCount === 0 ? Promise.reject(err) : requestLoop(url, maxCount - 1))
}

