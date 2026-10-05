import { prestart } from '../loading-stages'

declare global {
    namespace ig {
        namespace ACTION_STEP {
            namespace CALL_EVENT {
                interface Settings {
                    steps: ig.EventStepBase.Settings[]
                    runType?: ig.EventRunType | keyof typeof ig.EventRunType
                    noWait?: boolean
                }
            }
            interface CALL_EVENT extends ig.ActionStepBase {
                event: ig.Event
                runType: ig.EventRunType
                noWait?: boolean
            }
            interface CALL_EVENT_CONSTRUCTOR extends ImpactClass<CALL_EVENT> {
                new (settings: ig.ACTION_STEP.CALL_EVENT.Settings): CALL_EVENT
            }
            var CALL_EVENT: CALL_EVENT_CONSTRUCTOR
        }
        interface ActorEntity {
            callEventStepEventCall?: ig.EventCall
        }
    }
}

prestart(() => {
    ig.ACTION_STEP.CALL_EVENT = ig.ActionStepBase.extend({
        init(settings) {
            this.noWait = settings.noWait
            this.runType =
                (typeof settings.runType == 'string' ? ig.EventRunType[settings.runType] : settings.runType) ??
                ig.EventRunType.PARALLEL

            if (!settings.steps) throw new Error('ig.ACTION_STEP.CALL_EVENT "steps" missing!')
            this.event = new ig.Event({ name: 'CALL_EVENT', steps: settings.steps })
        },
        start(target) {
            const call = ig.game.events.callEvent(this.event, this.runType)
            target.callEventStepEventCall = call
        },
        run(target) {
            return this.noWait || !target.callEventStepEventCall || target.callEventStepEventCall.done
        },
    })
})
