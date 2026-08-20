import { prestart } from './loading-stages'
import { Opts } from './options'

prestart(() => {
    ig.MapSoundEntry.inject({
        start() {
            const volumeMul = Opts.mapSoundsVolume
            const origVolumes = this.loopSounds.map(s => s.volume)
            for (const sound of this.loopSounds) {
                sound.volume *= volumeMul
            }

            this.parent()

            for (let i = 0; i < this.loopSounds.length; i++) {
                this.loopSounds[i].volume = origVolumes[i]
            }
        },
    })
})

export function resetMapSoundEntries() {
    ig.mapSounds?.currentEntry?.stop()
    ig.mapSounds?.currentEntry?.start()
}
