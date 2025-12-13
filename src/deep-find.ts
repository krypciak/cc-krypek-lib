export {}
declare global {
    function deepFind<T>(
        obj: T,
        lookingFor: any | ((obj: any) => boolean),
        path?: string,
        ignoreSet?: Set<string>,
        seen?: WeakMap<any, any>
    ): T

    interface Window {
        deepFind<T>(
            obj: T,
            lookingFor: any | ((obj: any) => boolean),
            path?: string,
            ignoreSet?: Set<string>,
            seen?: WeakMap<any, any>
        ): T
    }
    namespace NodeJS {
        interface Global {
            deepFind<T>(
                obj: T,
                lookingFor: any | ((obj: any) => boolean),
                path?: string,
                ignoreSet?: Set<string>,
                seen?: WeakMap<any, any>
            ): T
        }
    }
}

global.deepFind = window.deepFind = function deepCopy<T>(
    obj: T,
    lookingFor: any | ((obj: any) => boolean),
    path: string = '',
    ignoreSet: Set<string> = new Set(),
    seen = new WeakMap()
): T {
    if (Array.isArray(obj)) {
        const arr = obj.map((e, i) => deepCopy(e, lookingFor, `${path}[${i}]`, ignoreSet, seen)) as T
        seen.set(obj, arr)
        return arr
    }
    if (obj === null || typeof obj !== 'object' || typeof obj === 'function') {
        return obj
    }

    /* Handle circular references */
    if (seen.has(obj)) {
        return seen.get(obj)
    }

    /* Create a new object with the same prototype as the original */
    const newObj: T = Object.create(Object.getPrototypeOf(obj))

    /* Add the new object to the seen map to handle circular references */
    seen.set(obj, newObj)

    for (const key in obj) {
        if (key == 'onRequestExternal' || key == 'onRequest' || key == 'sendRequest') continue
        if (obj.hasOwnProperty(key)) {
            let badKey: boolean = false
            for (const ignoreKey of ignoreSet) {
                if (key === ignoreKey) {
                    badKey = true
                    break
                }
            }
            newObj[key] = badKey ? obj[key] : deepCopy(obj[key], lookingFor, `${path}.${key}`, ignoreSet, seen)
            const v: any = obj[key]
            if (v === lookingFor || (typeof lookingFor === 'function' && lookingFor(v))) {
                console.log(`%c${path}.${key}`, 'color: lime;', v)
            }
        }
    }
    return newObj
}
