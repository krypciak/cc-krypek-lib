import { prestart } from '../loading-stages'

declare global {
    namespace ig.EVENT_STEP {
        namespace LOG {
            interface Settings {
                text: ig.Event.StringExpression
                logType?: 'log' | 'warn' | 'error'
            }
        }
        interface LOG extends ig.EventStepBase {
            text: ig.Event.StringExpression
            logType: 'log' | 'warn' | 'error'
        }
        interface LOG_CONSTRUCTOR extends ImpactClass<LOG> {
            new (settings: ig.EVENT_STEP.LOG.Settings): LOG
        }
        var LOG: LOG_CONSTRUCTOR
    }
}
prestart(() => {
    ig.EVENT_STEP.LOG = ig.EventStepBase.extend({
        init(settings) {
            this.text = settings.text

            const logType = settings.logType?.toLowerCase() ?? 'log'
            if (logType != 'log' && logType != 'warn' && logType != 'error') {
                throw new Error(`ig.EVENT_STEP.LOG "logType" unknown log type: "${logType}"`)
            }
            this.logType = logType
        },
        start() {
            const text = ig.Event.getExpressionValue(this.text)

            if (this.logType == 'log') {
                console.log(text)
            } else if (this.logType == 'warn') {
                console.warn(text)
            } else if (this.logType == 'error') {
                console.error(text)
            }
        },
    })
})
