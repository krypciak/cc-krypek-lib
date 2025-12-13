import { prestart } from './loading-stages'
import type { InputFieldIsValidFunc } from 'ccmodmanager/types/mod-options'

export type MultiPageButtonGuiButtons = NonNullable<
    ConstructorParameters<modmanager.gui.MultiPageButtonBoxGuiConstructor>[2]
>

declare global {
    namespace sc {
        interface InputFieldDialog extends modmanager.gui.MultiPageButtonBoxGui {
            inputWrapper: modmanager.gui.InputFieldWrapper

            getText(this: this): string
            setText(this: this, text: string): void
        }
        interface InputFieldDialogConstructor extends ImpactClass<InputFieldDialog> {
            new (
                width: number,
                title: string,
                initialValue: string,
                buttons: MultiPageButtonGuiButtons,
                isValid?: InputFieldIsValidFunc,
                setValueFunc?: (text: string) => void
            ): InputFieldDialog
        }
        var InputFieldDialog: InputFieldDialogConstructor
    }
    namespace ig {
        var shownInputDialog: sc.InputFieldDialog | undefined
    }
}
prestart(() => {
    sc.InputFieldDialog = modmanager.gui.MultiPageButtonBoxGui.extend({
        init(width, title, initialValue, buttons, isValid, setValueFunc = () => {}) {
            this.parent(width, 70, buttons)

            this.setContent(title, [{ content: [''] }])
            this.inputWrapper = new modmanager.gui.InputFieldWrapper(initialValue, setValueFunc, width, isValid)
            this.scrollContainer.scrollPane.removeChildGui(this.scrollContainer.scrollPane.scrollbarV!)

            this.hook.pauseGui = true
            this.hook.temporary = true
            this.hook.zIndex = 9999999
        },
        openMenu() {
            this.parent()
            this.scrollContainer.setElement(this.inputWrapper)
            this.userButtonGroup!.addFocusGui(this.inputWrapper.inputField, 999, 999)
            this.scrollContainer.setPos(this.scrollContainer.hook.pos.x, this.scrollContainer.hook.pos.y + 1)

            if (ig.shownInputDialog)
                throw new Error('openMenu() called, but ig.shownInputDialog is was already defined!')
            ig.shownInputDialog = this
        },
        closeMenu() {
            this.parent()
            if (!ig.shownInputDialog) throw new Error('closeMenu() called, but ig.shownInputDialog is undefined!')
            ig.shownInputDialog = undefined
        },
        getText() {
            return this.inputWrapper.inputField.getValueAsString()
        },
        setText(text) {
            this.inputWrapper.inputField.setText(text)
            this.inputWrapper.inputField.onCharacterInput(text, '')
        },
    })
})
