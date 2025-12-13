import { prestart } from './loading-stages'
import { Opts } from './options'

prestart(() => {
    if (!Opts.displayUnknownLabelPaths) return

    ig.Lang.inject({
        get(label) {
            const temp = this.parent(label)
            return temp != 'UNKNOWN LABEL' ? temp : label
        },
    })
})
