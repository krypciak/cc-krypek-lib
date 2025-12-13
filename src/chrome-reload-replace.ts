import { prestart } from './loading-stages'
import { Opts } from './options'

prestart(() => {
    if (!Opts.chromeReloadReplace) return

    if (window.chrome) window.chrome.runtime.reload = () => location.reload()
})
