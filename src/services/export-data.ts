import { ok, fail } from '../domain/result.js'
import { encode } from '../storage/codec.js'
import { toCsv } from './csv.js'
import type { Context } from './context.js'
export async function exportData(ctx: Context, format = 'json') {
  if (format !== 'json' && format !== 'csv') return fail('validation', 'Format must be json or csv')
  const state = await ctx.repository.read()
  return state.ok ? ok(format === 'json' ? encode(state.value) : toCsv(state.value)) : state
}
