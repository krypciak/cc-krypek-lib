import type { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import { setModMetadata } from './mod-metadata'
import type { Mod1 } from './types'
import { executePostload, executePoststart, executePreload, executePrestart } from './loading-stages'

import './mute-startup-messages'
import './display-unknown-label-paths'
import './title-screen-skip'
import './chrome-reload-replace'
import './find-class-name'
import './deep-find'
import './steps/all'
import './input-field-dialog'
import './object-slider-dialog'
import './memory-leak-fix'
import './pvp-damage-factor-override'
import './mute-map-sounds'

export default class KrypekLib implements PluginClass {
    constructor(mod: Mod1) {
        setModMetadata(mod)
    }

    async preload() {
        await executePreload()
    }

    async prestart() {
        await executePrestart()
    }

    async postload() {
        await executePostload()
    }

    async poststart() {
        await executePoststart()
    }
}
