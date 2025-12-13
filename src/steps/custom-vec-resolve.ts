import { prestart } from '../loading-stages'

export type MarkerLike = ig.Entity & { name: string; applyMarkerPosition(entity: ig.Entity): void }

interface MarkerExpression {
    marker?: ig.Event.StringExpression
}
declare global {
    namespace ig.Event {
        interface Vec2ExpressionVarObject extends MarkerExpression {}
        interface Vec3ExpressionVarObject extends MarkerExpression {}
    }
}

function findMarker(name: string): MarkerLike | undefined {
    return ig.game.shownEntities.find(e => e && 'applyMarkerPosition' in e && e.name == name) as MarkerLike | undefined
}

function handleMarker(expr: ig.Event.StringExpression | undefined): Vec3 {
    const markerName = ig.Event.getExpressionValue(expr)
    const marker = findMarker(markerName)
    if (!marker) throw new Error(`marker: "${markerName}" not found!`)
    return Vec3.create(marker.coll.pos)
}

prestart(() => {
    const orig = ig.Event.getExpressionValue
    ig.Event.getExpressionValue = expr => {
        if (expr && typeof expr == 'object' && 'marker' in expr) {
            return handleMarker(expr.marker as any) as any
        }
        return orig(expr)
    }
})
