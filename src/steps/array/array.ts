import { prestart } from '../../loading-stages'
import { attemptForwardVar } from './var-object-forward'

import './array-entity-var-access'
import './array-regular-polygon-vertices'

declare global {
    namespace ig {
        // @ts-expect-error
        type VarValue = any

        namespace Event {
            type ArrayExpression<T = ig.VarValue> = ig.Event.VarExpression<T[]>
        }
        interface EventConstructor {
            getArray<T>(array: ig.Event.ArrayExpression<T>): T[]
        }
    }
}

interface StoredArray<T = ig.VarValue> extends Array<T> {}

prestart(() => {
    ig.Event.getArray = array => {
        let value = ig.Event.getExpressionValue(array) as StoredArray
        if (!Array.isArray(value))
            throw new Error(`ig.Event.getArray: resolved "${JSON.stringify(array)}" is not an array!`)
        value = value.map(v => ig.Event.getExpressionValue(v))
        return value
    }
})

declare global {
    namespace ig {
        namespace EVENT_STEP {
            namespace CHANGE_VAR_ARRAY {
                type ArrayOperation = 'set' | 'push' | 'erase' | 'intersect' | 'filterUnique'
                interface Settings {
                    changeType: ig.EVENT_STEP.CHANGE_VAR_ARRAY.ArrayOperation
                    varName: ig.Event.VariableExpression
                    value?: ig.Event.ArrayExpression
                }
            }
            interface CHANGE_VAR_ARRAY extends ig.EventStepBase {
                changeType: ig.EVENT_STEP.CHANGE_VAR_ARRAY.ArrayOperation
                varName: ig.Event.VariableExpression
                value?: ig.Event.ArrayExpression
            }
            interface CHANGE_VAR_ARRAY_CONSTRUCTOR extends ImpactClass<CHANGE_VAR_ARRAY> {
                new (settings: ig.EVENT_STEP.CHANGE_VAR_ARRAY.Settings): CHANGE_VAR_ARRAY
            }
            var CHANGE_VAR_ARRAY: CHANGE_VAR_ARRAY_CONSTRUCTOR
        }
        interface VarsConstructor {
            arrayVarAccess<T>(array: T[], keys: string[]): any
        }
    }
}

prestart(() => {
    ig.Vars.arrayVarAccess = function <T>(array: T[], keys: string[]) {
        if (keys.length == 0) return array
        if (keys[0] == 'length') return array.length
        const index = parseInt(keys[0])
        const value = array[index]
        const forwardValue = attemptForwardVar(value, keys, 1)
        if (forwardValue) return forwardValue
        return value
    }
})

function setArray<T>(array: T[], to: T[]) {
    array.length = to.length
    for (let i = 0; i < to.length; i++) array[i] = to[i]
}

prestart(() => {
    ig.EVENT_STEP.CHANGE_VAR_ARRAY = ig.EventStepBase.extend({
        init(settings) {
            this.changeType = settings.changeType
            this.varName = settings.varName
            this.value = settings.value
            if (!this.changeType) throw new Error(`ig.EVENT_STEP.CHANGE_VAR_ARRAY "operation" missing!`)
            if (!this.varName) throw new Error(`ig.EVENT_STEP.CHANGE_VAR_ARRAY "varName" missing!`)
        },
        start() {
            const varName = ig.Event.getVarName(this.varName)
            if (!varName) throw new Error('ig.EVENT_STEP.CHANGE_VAR_ARRAY "varName" is null!')

            const getArray = () => {
                if (!this.value) throw new Error(`ig.EVENT_STEP.CHANGE_VAR_ARRAY "value" missing!`)
                return ig.Event.getArray(this.value)
            }

            if (this.changeType == 'set') {
                const array = getArray()
                ig.vars.set(varName, array)
                return
            }

            const baseArray = ig.vars.get(varName)
            if (!Array.isArray(baseArray)) throw new Error('ig.EVENT_STEP.CHANGE_VAR_ARRAY "varName" is not an array!')

            if (this.changeType == 'filterUnique') {
                setArray(baseArray, [...new Set(baseArray)])
                return
            }

            const array = getArray()

            if (this.changeType == 'push') {
                baseArray.push(...array)
            } else if (this.changeType == 'erase') {
                for (const value of array) {
                    baseArray.erase(value)
                }
            } else if (this.changeType == 'intersect') {
                const intersection = baseArray.filter(x => array.includes(x))
                setArray(baseArray, intersection)
            } else throw new Error(`ig.EVENT_STEP.CHANGE_VAR_ARRAY invalid operation: "${this.changeType}"`)
        },
    })
})
