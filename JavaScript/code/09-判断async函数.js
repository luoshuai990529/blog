function isAsyncFuncion(func) {
    return func[Symbol.toStringTag] === 'AsyncFunction'
}


console.log(isAsyncFuncion(() => { }));
console.log(isAsyncFuncion(async () => { }));