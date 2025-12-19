import { prestart } from '../loading-stages'

declare global {
    namespace ig.EVENT_STEP {
        namespace FORCE_LEVEL_UP {
            interface Settings {}
        }
        interface FORCE_LEVEL_UP extends ig.EventStepBase {}
        interface FORCE_LEVEL_UPConstructor extends ImpactClass<FORCE_LEVEL_UP> {
            new (settings: ig.EVENT_STEP.FORCE_LEVEL_UP.Settings): FORCE_LEVEL_UP
        }
        var FORCE_LEVEL_UP: FORCE_LEVEL_UPConstructor
    }
}

prestart(() => {
    ig.EVENT_STEP.FORCE_LEVEL_UP = ig.EventStepBase.extend({
        run() {
            const p = ig.game.playerEntity
            if (p) {
                if (p.model.level == 99) {
                    p.model.setLevel(98, true)
                }
                p.model.addExperience(1000, p.model.level, 0, true, sc.LEVEL_CURVES.STATIC_REGULAR)
            }
            return true
        },
    })
})
