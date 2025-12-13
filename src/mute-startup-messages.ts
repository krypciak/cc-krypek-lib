import { preload, prestart } from './loading-stages'
import { Opts } from './options'

preload(() => {
    if (!Opts.muteStartupMsg) return

    const backup = console.log
    console.log = function (...args) {
        if (typeof args[0] == 'string' && args[0].startsWith('INIT')) {
            console.log = backup
            return
        }
        return backup(...args)
    }
})

prestart(() => {
    if (!Opts.muteStartupMsg) return

    ig.ExtensionList.inject({
        // @ts-expect-error
        onExtensionListLoaded(...args) {
            const backup = console.log
            console.log = () => {}
            // @ts-expect-error
            this.parent(...args)
            console.log = backup
        },
    })
    ig.Font.inject({
        // @ts-expect-error
        _loadMetrics(...args) {
            const backup = HTMLCanvasElement.prototype.getContext
            HTMLCanvasElement.prototype.getContext = function (
                this: HTMLCanvasElement,
                type: '2d',
                options: undefined
            ) {
                if (options) throw new Error()
                return backup.call(this, type, { willReadFrequently: true })
            } as any

            // @ts-expect-error
            this.parent(...args)
            HTMLCanvasElement.prototype.getContext = backup
        },
    })
})
