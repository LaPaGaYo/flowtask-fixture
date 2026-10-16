import { ok, fail, type Result } from '../domain/result.js'
import { counts } from './reports/counts.js'
import { overdue } from './reports/overdue.js'
import { upcoming } from './reports/upcoming.js'
import { completions } from './reports/completions.js'
import { dependencyGraph } from './reports/dependency-graph.js'
import { dateRange } from './date-range.js'
import type { Context } from './context.js'
export async function runReport(ctx: Context, name: string, input: unknown = {}): Promise<Result<unknown>> {
  const range = dateRange(input)
  if (!range.ok) return range
  const state = await ctx.repository.read()
  if (!state.ok) return state
  switch (name) {
    case 'counts': return ok(counts(state.value))
    case 'overdue': return ok(overdue(state.value, ctx.clock))
    case 'upcoming-7-days': return ok(upcoming(state.value, ctx.clock))
    case 'dependency-graph': return ok(dependencyGraph(state.value))
    case 'completion-per-day': {
      const { from, to } = range.value
      if (!from || !to || (Date.parse(to) - Date.parse(from)) / 86_400_000 > 36600) {
        return fail('validation', 'Completion report requires from and to within 36600 days')
      }
      return ok(completions(state.value, from, to))
    }
    default: return fail('not_found', 'Report does not exist')
  }
}
