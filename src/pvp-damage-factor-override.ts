import { prestart } from './loading-stages'

declare global {
    namespace sc {
        interface PvpModel {
            damageFactorOverride: Nullable<number>

            onVarsChanged(this: this): void
        }
        interface PvpModelConstructor {
            damageFactorOverrideVariable: string
        }
    }
}

prestart(() => {
    sc.PvpModel.damageFactorOverrideVariable = 'tmp.pvpDamageFactor'
    sc.PvpModel.inject({
        damageFactorOverride: null,
        getDmgFactor() {
            if (this.damageFactorOverride !== null) return this.damageFactorOverride
            return this.parent()
        },
        onVarsChanged() {
            this.parent?.()
            const factor = ig.vars.get(sc.PvpModel.damageFactorOverrideVariable)
            if (factor === undefined || factor === null) {
                this.damageFactorOverride = null
            } else {
                this.damageFactorOverride = Number(factor)
            }
        },
    })
})
