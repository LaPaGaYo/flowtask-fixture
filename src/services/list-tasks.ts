import { queryTasks } from '../domain/query.js'
import { ok } from '../domain/result.js'
import { parseView } from '../domain/validate-view.js'
import type { Context } from './context.js'
export async function listTasks(ctx: Context, filter: unknown = {}, sort: unknown = 'priority') {
  const parsed = parseView({ id: 'query', name: 'query', filter, sort })
  if (!parsed.ok) return parsed
  const state = await ctx.repository.read()
  return state.ok ? ok(queryTasks(state.value.tasks, parsed.value.filter, parsed.value.sort)) : state
}
