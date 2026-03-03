import { prestart } from '../../loading-stages'

export function forwardVarAccess(obj: ig.Vars.Accessor, keys: string[]) {
    if (!obj) return null
    if (keys.length == 0) return obj
    if (obj.onVarAccess) {
        let newPath = keys[0] ?? ''
        for (let i = 1; i < keys.length; i++) {
            newPath += '.' + keys[i]
        }
        return obj.onVarAccess(newPath, keys)
    }
    return null
}

function attemptForwardVar(
    value: unknown,
    keys: string[],
    keysOffset: number
): { success: boolean; forwardValue: any } {
    if (value && typeof value === 'object') {
        if (value instanceof ig.Entity) {
            return { success: true, forwardValue: ig.vars.forwardEntityVarAccess(value, keys, keysOffset) }
        } else if ('onVarAccess' in value && typeof value.onVarAccess === 'function') {
            return { success: true, forwardValue: forwardVarAccess(value as ig.Vars.Accessor, keys.slice(keysOffset)) }
        }
    }
    return { success: false, forwardValue: value }
}

let fromResolve = false
prestart(() => {
    ig.Vars.inject({
        _get(path) {
            if (path) {
                const keys = path.split('.')
                var obj = this.storage
                for (let i = 0; i < keys.length; i++) {
                    const v = obj[keys[i]]
                    if (!v || typeof v != 'object') break
                    obj = v

                    const { success, forwardValue } = attemptForwardVar(obj, keys, i + 1)
                    if (success) return forwardValue
                }
            }

            const ret = this.parent(path)
            if (fromResolve && typeof ret === 'number') return ret.toString()
            return ret
        },
    })
})

prestart(() => {
    const orig = ig.VarPathResolver.resolve
    ig.VarPathResolver.resolve = function (this: ig.VarPathResolver, path: string) {
        fromResolve = true
        const ret = orig.call(this, path)
        fromResolve = false
        return ret
    }
})

declare global {
    namespace ig {
        interface VarsConstructor {
            forwardVar(value: unknown, keys: string[], keysOffest: number): any
        }
    }
}
prestart(() => {
    ig.Vars.forwardVar = function (value, keys, keysOffest) {
        const { forwardValue } = attemptForwardVar(value, keys, keysOffest)
        return forwardValue
    }
})
