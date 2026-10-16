import { fail, ok } from '../domain/result.js'
import { queryTasks } from '../domain/query.js'
import type { Context } from './context.js'
export async function runView(ctx: Context, id: string) {
  const state = await ctx.repository.read()
  if (!state.ok) return state
  const view = state.value.views.find(item => item.id === id)
  return view ? ok(queryTasks(state.value.tasks, view.filter, view.sort)) : fail('not_found', 'View does not exist')
}
