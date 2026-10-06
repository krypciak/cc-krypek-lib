import { prestart } from './loading-stages'

// sc.NPCRunnerEntity that exit through ig.ENTITY.TeleportGround never despawn
// due to an infinite wait action ({ type: 'WAIT', time: -1 }) in ig.ENTITY.TeleportGround#getEnterActionData
// other exits don't have this issue because they use a finite wait of 1 second ({ type: 'WAIT', time: 1 })
// this causes slow entity accumulation leading to lag

prestart(() => {
    ig.ENTITY.TeleportGround.inject({
        getEnterActionData(actor) {
            const steps = this.parent(actor)
            for (let i = steps.length - 1; i >= 0; i++) {
                const step = steps[i]
                if (step.type == 'WAIT' && step.time == -1) {
                    step.time = 1
                    break
                }
            }
            return steps
        },
    })
})
