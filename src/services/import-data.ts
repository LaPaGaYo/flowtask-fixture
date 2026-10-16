import { ok, fail } from '../domain/result.js'
import { decode } from '../storage/codec.js'
import { fromCsv } from './csv.js'
import { record } from './record.js'
import type { Context } from './context.js'
export async function importData(ctx: Context, text: string, format = 'json') {
  if (format !== 'json' && format !== 'csv') return fail('validation', 'Format must be json or csv')
  const parsed = format === 'json' ? decode(text) : fromCsv(text)
  if (!parsed.ok) return parsed
  return ctx.repository.transact(state => {
    for (const event of parsed.value.activity) {
      const existing = state.activity.find(item => item.id === event.id)
      if (existing && JSON.stringify(existing) !== JSON.stringify(event)) return fail('conflict', 'Imported activity conflicts with local history')
      if (!existing) state.activity.push(event)
    }
    state.projects = parsed.value.projects
    state.tasks = parsed.value.tasks
    state.tags = parsed.value.tags
    state.views = parsed.value.views
    record(ctx, state, 'store', 'store.imported')
    return ok({ projects: state.projects.length, tasks: state.tasks.length, tags: state.tags.length, views: state.views.length })
  })
}
