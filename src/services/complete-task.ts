import { isReady } from '../domain/dependencies.js'
import { nextOccurrence } from '../domain/recurrence.js'
import { ok, fail, type Result } from '../domain/result.js'
import type { Task } from '../domain/task.js'
import { identifier, record } from './record.js'
import type { Context } from './context.js'
export function completeTask(ctx: Context, id: string): Promise<Result<{ task: Task; nextTask: Task | null }>> {
  return ctx.repository.transact(state => {
    const task = state.tasks.find(item => item.id === id)
    if (!task) return fail('not_found', 'Task does not exist')
    if (task.status === 'done' || task.status === 'canceled') return fail('conflict', 'Task is already closed')
    if (!isReady(task, state.tasks)) return fail('blocked', 'Task has incomplete dependencies')
    task.status = 'done'
    task.updatedAt = ctx.clock.now()
    record(ctx, state, id, 'task.completed')
    let nextTask: Task | null = null
    if (task.recurrence) {
      const today = ctx.clock.now().slice(0, 10)
      nextTask = { ...task, id: identifier(ctx, state), status: 'todo', createdAt: ctx.clock.now(), updatedAt: ctx.clock.now(),
        dueDate: nextOccurrence(task.recurrence, task.dueDate ?? today, today), tags: [...task.tags], blockedBy: [...task.blockedBy] }
      state.tasks.push(nextTask)
      record(ctx, state, nextTask.id, 'task.created')
    }
    return ok({ task, nextTask })
  })
}
