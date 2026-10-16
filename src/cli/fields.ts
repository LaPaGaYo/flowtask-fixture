import { ok, fail, type Result } from '../domain/result.js'
import type { Options } from './types.js'
export function taskFields(options: Options): Result<Record<string, unknown>> {
  const input: Record<string, unknown> = {}
  for (const [flag, field] of Object.entries({ project: 'projectId', title: 'title', description: 'description', status: 'status', priority: 'priority' })) {
    if (options[flag] !== undefined) input[field] = options[flag]
  }
  if (options.due !== undefined) input.dueDate = options.due === 'null' ? null : options.due
  for (const [flag, field] of [['tags', 'tags'], ['blocked-by', 'blockedBy']] as const) {
    const value = options[flag]
    if (typeof value === 'string') input[field] = value === '' ? [] : value.split(',')
  }
  if (typeof options.recurrence === 'string') {
    try { input.recurrence = JSON.parse(options.recurrence) as unknown }
    catch { return fail('usage', 'Recurrence must be JSON') }
  }
  return ok(input)
}
export function filterFields(options: Options): Result<unknown> {
  if (typeof options.filter === 'string') {
    try { return ok(JSON.parse(options.filter) as unknown) }
    catch { return fail('usage', 'Filter must be JSON') }
  }
  const input: Record<string, unknown> = {}
  for (const [flag, field] of [['project', 'projectId'], ['status', 'status'], ['ready', 'ready']] as const) {
    if (options[flag] !== undefined) input[field] = options[flag]
  }
  return ok(input)
}
export function rangeFields(options: Options): Record<string, unknown> {
  return Object.fromEntries(['from', 'to'].filter(key => options[key] !== undefined).map(key => [key, options[key]]))
}
