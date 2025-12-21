// @ts-expect-error
if (window.process?._events?.uncaughtException?.length) {
    // @ts-expect-error
    window.process._events.uncaughtException.length = 0
}
// @ts-expect-error
window.process._events.uncaughtException = function () {}
// @ts-expect-error
delete global.ig
// @ts-expect-error
delete global.sc
