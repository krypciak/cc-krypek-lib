import type { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import ccmod from '../ccmod.json'
import type { Mod1 } from './types'
import { executePostload, executePoststart, executePreload, executePrestart } from './loading-stages'

import './mute-startup-messages'
import './display-unknown-label-paths'
import './title-screen-skip'
import './chrome-reload-replace'
import './find-class-name'
import './deep-find'

export default class KrypekLib implements PluginClass {
    static dir: string
    static mod: Mod1
    static manifset: typeof import('../ccmod.json') = ccmod

    constructor(mod: Mod1) {
        KrypekLib.dir = mod.baseDirectory
        KrypekLib.mod = mod
        KrypekLib.mod.isCCL3 = mod.findAllAssets ? true : false
        KrypekLib.mod.isCCModPacked = mod.baseDirectory.endsWith('.ccmod/')
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
