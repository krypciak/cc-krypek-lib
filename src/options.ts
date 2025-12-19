import type { Options } from 'ccmodmanager/types/mod-options'
import KrypekLib from './plugin'
import { preload } from './loading-stages'

export let Opts: ReturnType<typeof modmanager.registerAndGetModOptions<ReturnType<typeof registerOpts>>>

export function registerOpts() {
    const opts = {
        general: {
            settings: {
                title: 'General',
                tabIcon: 'general',
            },
            headers: {
                general: {
                    muteStartupMsg: {
                        type: 'CHECKBOX',
                        name: 'Mute startup messages',
                        description: 'Do not print out the vanilla startup messages into dev console',
                        init: false,
                    },
                    displayUnknownLabelPaths: {
                        type: 'CHECKBOX',
                        name: 'Display unknown label paths',
                        description: `When a lang label is missing, instead of "UNKNOWN" display it's path`,
                        init: false,
                    },
                    titleScreenSkip: {
                        type: 'CHECKBOX',
                        name: 'Title screen skip',
                        description: 'Skip the title screen',
                        init: false,
                    },
                    chromeReloadReplace: {
                        type: 'CHECKBOX',
                        name: 'Replace chrome reload',
                        description: 'Replace chorme.runtime.reload() with location.reload()',
                        init: false,
                    },
                    printWarningOnUnknownStep: {
                        type: 'CHECKBOX',
                        name: 'Warn on unknown step',
                        description: `Print a warning to console when a step that doesn't exist is parsed`,
                        init: false,
                    },
                },
            },
        },
    } as const satisfies Options

    Opts = modmanager.registerAndGetModOptions(
        {
            modId: KrypekLib.manifset.id,
            title: KrypekLib.manifset.title,
        },
        opts
    )
    return opts
}

preload(() => {
    registerOpts()
}, 0)
