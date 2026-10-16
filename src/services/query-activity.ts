import { ok } from '../domain/result.js'
import { dateRange } from './date-range.js'
import type { Context } from './context.js'
export async function queryActivity(ctx: Context, input: unknown = {}) {
  const range = dateRange(input)
  if (!range.ok) return range
  const state = await ctx.repository.read()
  if (!state.ok) return state
  const { from, to, entityId } = range.value
  return ok(state.value.activity.filter(event => (!entityId || event.entityId === entityId)
    && (!from || event.at.slice(0, 10) >= from) && (!to || event.at.slice(0, 10) <= to)))
}
