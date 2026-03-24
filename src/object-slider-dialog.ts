import type { MultiPageButtonGuiButtons } from './input-field-dialog'
import { prestart } from './loading-stages'

declare global {
    namespace sc {
        namespace ObjectSliderDialog {
            /* ccmodmanager like options */
            type Config = {
                init: number
                fill?: boolean
                showPercentage?: boolean
                /** Force the thumb width (values below 30 will be ignored) */
                thumbWidth?: number

                customNumberDisplay?: (index: number) => number | string
            } & (
                | {
                      min: number
                      max: number
                      step: number
                      data?: Record<string, number>
                  }
                | {
                      data: Record<string, number>
                  }
            )
        }
        interface ObjectSliderDialog extends modmanager.gui.MultiPageButtonBoxGui {
            sliderConfig: sc.ObjectSliderDialog.Config
            entries: number[]
            slider: sc.OptionFocusSlider
            _lastVal: number
            currentNumber: sc.TextGui
            rowButtonGroup: sc.RowButtonGroup

            getValue(this: this): number
            updateNumberDisplay(this: this): void
            onSliderChange(this: this, index: number): void
            onSliderLeftRight(this: this, direction: boolean): void
        }
        interface ObjectSliderDialogConstructor extends ImpactClass<ObjectSliderDialog> {
            new (
                width: number,
                title: string,
                buttons: MultiPageButtonGuiButtons,
                sliderConfig: sc.ObjectSliderDialog.Config
            ): ObjectSliderDialog
        }
        var ObjectSliderDialog: ObjectSliderDialogConstructor
    }
}
prestart(() => {
    sc.ObjectSliderDialog = modmanager.gui.MultiPageButtonBoxGui.extend({
        init(width, title, buttons, sliderConfig) {
            this.parent(width, 70, buttons)
            this.scrollContainer.scrollPane.removeChildGui(this.scrollContainer.scrollPane.scrollbarV!)
            this.setContent(title, [{ content: [''] }])

            this.sliderConfig = sliderConfig

            if (!('data' in sliderConfig)) {
                const data: Record<number, number> = {}
                const { min, max, step } = sliderConfig
                for (let i = min, h = 0; i.round(2) <= max; i += step, h++) {
                    data[h] = i.round(2)
                }
                sliderConfig.data = data
            }
            this.entries = Object.values(sliderConfig.data!)

            const fill = sliderConfig.fill
            const thumbWidth = Math.max(30, sliderConfig.thumbWidth ?? Math.floor(252 / this.entries.length))

            const value = sliderConfig.init
            let index = this.entries.findIndex(v => v == value)
            if (index == -1) index = 0

            this.rowButtonGroup = new sc.RowButtonGroup()
            this.rowButtonGroup.setLeftRightCallback(this.onSliderLeftRight.bind(this))

            this.slider = new sc.OptionFocusSlider(this.onSliderChange.bind(this), true, fill, this.rowButtonGroup)
            this.entries = Object.values(sliderConfig.data!)
            this.slider.setPreferredThumbSize(thumbWidth, 21)

            this.slider.setPos(0, 0)
            this.slider.setMinMaxValue(0, this.entries.length - 1)
            this._lastVal = index
            this.slider.setValue(index)
            this.slider.setSize(width - 4, 21, 9)
            this.slider.hook.transitions = this.hook.transitions
            this.slider.doStateTransition('HIDDEN', true)
            this.addChildGui(this.slider)

            this.currentNumber = new sc.TextGui('')
            this.currentNumber.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER)
            this.slider.thumb.addChildGui(this.currentNumber)

            this.updateNumberDisplay()
            this.onSliderChange(index)

            this.rowButtonGroup.addFocusGui(this.slider, 0, 0)

            for (let i = 0; i < this.userButtonGroup!.elements.length; i++) {
                const button = this.userButtonGroup!.elements[i][0]
                this.rowButtonGroup.addFocusGui(button, i, 1)
            }
            this.buttonInteract.removeButtonGroup(this.userButtonGroup!)
            this.userButtonGroup = this.rowButtonGroup
            this.buttonInteract.pushButtonGroup(this.userButtonGroup!)

            this.hook.pauseGui = true
            this.hook.temporary = true
            this.hook.zIndex = 9999999
        },
        openMenu() {
            this.parent()
            this.slider.doStateTransition('DEFAULT')
        },
        closeMenu() {
            this.parent()
            this.slider.doStateTransition('HIDDEN')
        },
        getValue() {
            const index = this.slider.getValue()
            return this.entries[index]
        },
        updateNumberDisplay() {
            const func = this.sliderConfig.customNumberDisplay
            if (func) {
                let ret = func.call(this.sliderConfig, this._lastVal)
                if (typeof ret == 'number') {
                    ret = ret.round(3)
                }
                this.currentNumber.setText(ret.toString())
                return
            }

            if (this.sliderConfig.showPercentage) {
                const text = Math.round(this.entries[this._lastVal] * 100) + '%'
                this.currentNumber.setText(text)
            } else {
                const num = this._lastVal + 1
                this.currentNumber.setText(num.round(3).toString())
            }
        },
        onSliderChange(index) {
            if (index != this._lastVal) {
                this._lastVal = index
                this.updateNumberDisplay()
            }
        },
        onSliderLeftRight(direction) {
            if (this.rowButtonGroup.currentRow == 0) {
                const val = direction ? this._lastVal + 1 : this._lastVal - 1
                this.slider.setValue(val)
                this.onSliderChange(this.slider.getValue())
            }

            this.rowButtonGroup.focusCurrentButton(
                this.rowButtonGroup.currentRow,
                this.rowButtonGroup.rowIndex[this.rowButtonGroup.currentRow],
                false,
                false,
                true
            )
        },
    })
})
