import { isDate, isTimestamp } from './date.js'
import { isRecord, nonempty, strings } from './guards.js'
import { parseRecurrence } from './recurrence.js'
import { ok, fail, type Result } from './result.js'
import type { Task } from './task.js'
export function parseTask(value: unknown): Result<Task> {
  if (!isRecord(value) || !nonempty(value.id) || !nonempty(value.projectId) || !nonempty(value.title)
    || typeof value.description !== 'string' || (typeof value.status !== 'string' || !['todo', 'doing', 'done', 'canceled'].includes(value.status))
    || (typeof value.priority !== 'string' || !['p1', 'p2', 'p3', 'p4'].includes(value.priority)) || !(value.dueDate === null || isDate(value.dueDate))
    || !strings(value.tags) || !strings(value.blockedBy) || !isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt)) {
    return fail('validation', 'Invalid task fields')
  }
  const recurrence = parseRecurrence(value.recurrence)
  if (!recurrence.ok) return recurrence
  return ok({ id: value.id, projectId: value.projectId, title: value.title.trim(), description: value.description,
    status: value.status as Task['status'], priority: value.priority as Task['priority'], dueDate: value.dueDate,
    tags: [...new Set(value.tags)].toSorted(), blockedBy: [...new Set(value.blockedBy)].toSorted(),
    createdAt: value.createdAt, updatedAt: value.updatedAt, recurrence: recurrence.value })
}
