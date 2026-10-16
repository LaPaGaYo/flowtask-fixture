import { allIds, type Snapshot } from '../storage/snapshot.js'
import type { Context } from './context.js'
export const identifier = (ctx: Context, state: Snapshot): string => ctx.ids.next(allIds(state))
export function record(ctx: Context, state: Snapshot, entityId: string, action: string): void {
  state.activity.push({ id: identifier(ctx, state), entityId, action, at: ctx.clock.now() })
}
