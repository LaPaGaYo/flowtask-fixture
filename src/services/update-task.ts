import { fail } from '../domain/result.js'
import { inputFields } from './input.js'
import { editTask } from './edit-task.js'
import type { Context } from './context.js'
export function updateTask(ctx: Context, id: string, input: unknown) {
  const fields = inputFields(input, ['projectId', 'title', 'description', 'status', 'priority', 'dueDate', 'tags', 'blockedBy', 'recurrence'])
  if (!fields.ok) return Promise.resolve(fields)
  if (fields.value.status !== undefined && (typeof fields.value.status !== 'string' || !['todo', 'doing'].includes(fields.value.status))) {
    return Promise.resolve(fail('validation', 'Use done or cancel to close a task'))
  }
  return editTask(ctx, id, 'task.updated', () => fields.value)
}
