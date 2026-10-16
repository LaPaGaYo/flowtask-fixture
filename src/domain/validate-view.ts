import { isRecord, nonempty } from './guards.js'
import { ok, fail, type Result } from './result.js'
import type { SavedView, TaskFilter, TaskSort } from './saved-view.js'
export function parseFilter(value: unknown): Result<TaskFilter> {
  if (!isRecord(value) || Object.keys(value).some(key => !['status', 'projectId', 'tag', 'ready'].includes(key))
    || (value.status !== undefined && (typeof value.status !== 'string' || !['todo', 'doing', 'done', 'canceled'].includes(value.status)))
    || (value.projectId !== undefined && !nonempty(value.projectId))
    || (value.tag !== undefined && !nonempty(value.tag)) || (value.ready !== undefined && typeof value.ready !== 'boolean')) {
    return fail('validation', 'Invalid task filter')
  }
  return ok({ ...value } as TaskFilter)
}
export function parseView(value: unknown): Result<SavedView> {
  if (!isRecord(value) || !nonempty(value.id) || !nonempty(value.name)
    || (typeof value.sort !== 'string' || !['priority', 'dueDate', 'createdAt', 'title'].includes(value.sort))) return fail('validation', 'Invalid saved view')
  const filter = parseFilter(value.filter)
  return filter.ok ? ok({ id: value.id, name: value.name.trim(), filter: filter.value, sort: value.sort as TaskSort }) : filter
}
