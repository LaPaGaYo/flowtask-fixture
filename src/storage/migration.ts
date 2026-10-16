import { isRecord } from '../domain/guards.js'
import { fail, type Result } from '../domain/result.js'
import type { Snapshot } from './snapshot.js'
import { validateSnapshot } from './validate-snapshot.js'
export function migrate(value: unknown): Result<Snapshot> {
  if (!isRecord(value)) return fail('validation', 'Expected a JSON object')
  if (value.version === 1) return validateSnapshot(value)
  if (value.version !== 0) return fail('validation', 'Unsupported schema version')
  // Version zero predates tags, views, activity and recurring/dependent tasks.
  const tasks = Array.isArray(value.tasks) ? value.tasks.map((item: unknown) => isRecord(item)
    ? { description: '', tags: [], blockedBy: [], recurrence: null, updatedAt: item.createdAt, ...item } : item) : value.tasks
  return validateSnapshot({ ...value, version: 1, tasks, tags: value.tags ?? [], views: value.views ?? [], activity: value.activity ?? [] })
}
