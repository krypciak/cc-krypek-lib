import { prestart } from '../loading-stages'

declare global {
    namespace ig {
        namespace EVENT_STEP {
            namespace SET_VAR {
                interface Settings {
                    varName: ig.Event.VariableExpression
                    value: ig.Event.VarExpression
                }
            }
            interface SET_VAR extends ig.EventStepBase {
                varName: ig.Event.VariableExpression
                value: ig.Event.VarExpression
            }
            interface SET_VAR_CONSTRUCTOR extends ImpactClass<SET_VAR> {
                new (settings: ig.EVENT_STEP.SET_VAR.Settings): SET_VAR
            }
            var SET_VAR: SET_VAR_CONSTRUCTOR
        }
    }
}

prestart(() => {
    ig.EVENT_STEP.SET_VAR = ig.EventStepBase.extend({
        init(settings) {
            this.varName = settings.varName
            this.value = settings.value
            if (!this.varName) throw new Error(`ig.EVENT_STEP.SET_VAR "varName" missing!`)
            if (!this.value) throw new Error(`ig.EVENT_STEP.SET_VAR "value" missing!`)
        },
        start() {
            const varName = ig.Event.getVarName(this.varName)
            if (!varName) throw new Error('ig.EVENT_STEP.SET_VAR "varName" is null!')

            const value = ig.Event.getExpressionValue(this.value)

            ig.vars.set(varName, value)
        },
    })
})
