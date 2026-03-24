import { prestart } from '../loading-stages'

declare global {
    namespace ig.EVENT_STEP {
        namespace SHOW_OBJECT_SLIDER_DIALOG {
            interface Settings {
                width?: number
                title: ig.Event.StringExpression
                saveToVar?: ig.Event.VariableExpression

                initialValue?: ig.Event.NumberExpression
                min?: ig.Event.NumberExpression
                max?: ig.Event.NumberExpression
                step?: ig.Event.NumberExpression
                fill?: ig.Event.BooleanExpression
                showPercentage?: ig.Event.BooleanExpression
                thumbWidth?: ig.Event.NumberExpression

                accepted?: ig.EventStepBase.Settings[]
                declined?: ig.EventStepBase.Settings[]
            }
            interface Data {
                dialog: sc.ObjectSliderDialog
                accepted: boolean
            }
        }
        interface SHOW_OBJECT_SLIDER_DIALOG extends ig.EventStepBase {
            width: number
            title: ig.Event.StringExpression
            saveToVar?: ig.Event.StringExpression

            initialValue?: ig.Event.NumberExpression
            fill?: ig.Event.BooleanExpression
            showPercentage?: ig.Event.BooleanExpression
            thumbWidth?: ig.Event.NumberExpression
            min?: ig.Event.NumberExpression
            max?: ig.Event.NumberExpression
            step?: ig.Event.NumberExpression

            branchList: string[]

            validFunction?: (str: string) => boolean

            start(this: this, data: ig.EVENT_STEP.SHOW_OBJECT_SLIDER_DIALOG.Data, eventCall?: ig.EventCall): void
            run(this: this, data: ig.EVENT_STEP.SHOW_OBJECT_SLIDER_DIALOG.Data): boolean
            getNext(this: this, data: ig.EVENT_STEP.SHOW_OBJECT_SLIDER_DIALOG.Data): Nullable<ig.EventStepBase>
        }
        interface SHOW_OBJECT_SLIDER_DIALOG_CONSTRUCTOR extends ImpactClass<SHOW_OBJECT_SLIDER_DIALOG> {
            new (settings: ig.EVENT_STEP.SHOW_OBJECT_SLIDER_DIALOG.Settings): SHOW_OBJECT_SLIDER_DIALOG
        }
        var SHOW_OBJECT_SLIDER_DIALOG: SHOW_OBJECT_SLIDER_DIALOG_CONSTRUCTOR
    }
}

prestart(() => {
    ig.EVENT_STEP.SHOW_OBJECT_SLIDER_DIALOG = ig.EventStepBase.extend({
        init(settings) {
            this.width = settings.width ?? 200
            this.title = settings.title
            this.saveToVar = settings.saveToVar

            this.initialValue = settings.initialValue
            this.fill = settings.fill
            this.showPercentage = settings.showPercentage
            this.thumbWidth = settings.thumbWidth
            this.min = settings.min
            this.max = settings.max
            this.step = settings.step

            this.branchList = []
            if (settings.accepted) this.branchList.push('accepted')
            if (settings.declined) this.branchList.push('declined')
        },
        start(data, _eventCall) {
            const title = ig.Event.getExpressionValue(this.title)
            const saveToVar = ig.Event.getVarName(this.saveToVar)

            const init = ig.Event.getExpressionValue(this.initialValue) ?? 0
            const min = ig.Event.getExpressionValue(this.min)
            const max = ig.Event.getExpressionValue(this.max)
            const step = ig.Event.getExpressionValue(this.step)
            const showPercentage = ig.Event.getExpressionValue(this.showPercentage)
            const thumbWidth = ig.Event.getExpressionValue(this.thumbWidth)
            const fill = ig.Event.getExpressionValue(this.fill)
            const config: sc.ObjectSliderDialog.Config = {
                init,
                min,
                max,
                step,
                showPercentage,
                thumbWidth,
                fill,
                customNumberDisplay: !showPercentage
                    ? function (index) {
                          return (min + index * step).round(3).toString()
                      }
                    : undefined,
            }

            let dialog: sc.ObjectSliderDialog
            dialog = new sc.ObjectSliderDialog(
                this.width,
                title,
                [
                    {
                        name: 'Ok',
                        onPress() {
                            const text = dialog.getValue()
                            if (saveToVar) ig.vars.set(saveToVar, text)
                            dialog.closeMenu()
                            data.accepted = true
                        },
                    },
                    {
                        name: 'Cancel',
                        onPress() {
                            dialog.closeMenu()
                            data.accepted = false
                        },
                    },
                ],
                config
            )
            dialog.openMenu()
            data.dialog = dialog
        },
        run({ dialog }) {
            return dialog.hook.currentStateName != 'DEFAULT'
        },
        getBranchNames() {
            return this.branchList
        },
        getNext(data) {
            const step = this.branches![data.accepted ? 'accepted' : 'declined']
            if (step) return step
            return this.parent(data)
        },
    })
})
