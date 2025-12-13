export {}
declare global {
    interface Window {
        findClassName(id: any): string
        fcn(id: any): string
    }
    namespace NodeJS {
        interface Global {
            findClassName(id: any): string
            fcn(id: any): string
        }
    }
}
const classNameCache: Record<number, string> = {}

global.fcn =
    window.fcn =
    global.findClassName =
    window.findClassName =
        function findClassName(id: any): string {
            if (id === undefined || id === null) return 'UNKNOWN'

            function rec(ns: any, path: string, depthLeft: number, aggresive: boolean = false): string | undefined {
                if (!ns || depthLeft <= 0) return
                if (typeof ns === 'function' && ns.classId === id) return path
                if (typeof ns === 'object')
                    for (const key in ns) {
                        if (!Number.isNaN(Number(key))) continue
                        if (key == 'classIdToClass') continue
                        if (aggresive && key[0] != key[0].toUpperCase()) continue
                        const name = rec(ns[key], path + '.' + key, depthLeft - 1)
                        if (name) return name
                    }
            }

            if (id.classId) id = id.classId
            if (classNameCache[id]) return classNameCache[id]

            let name = rec(ig, 'ig', 4, true)
            if (name) return (classNameCache[id] = name)

            name = rec(sc, 'sc', 4, true)
            if (name) return (classNameCache[id] = name)

            name = rec(modmanager, 'modmanager', 4)
            if (name) return (classNameCache[id] = name)

            if ('dummy' in window) {
                name = rec(window.dummy, 'dummy', 4)
                if (name) return (classNameCache[id] = name)
            }
            if ('multi' in window) {
                name = rec(window.multi, 'multi', 4)
                if (name) return (classNameCache[id] = name)
            }
            if ('determine' in window) {
                name = rec(window.determine, 'determine', 6)
                if (name) return (classNameCache[id] = name)
            }
            // if ('instanceinator' in window) {
            //     name = rec(window.instanceinator, 'instanceinator', 4)
            //     if (name) return name
            // }
            return 'UNKNOWN'
        }
