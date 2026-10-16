import { fail, type Result } from '../domain/result.js'
import type { Task } from '../domain/task.js'
import { parseTask } from '../domain/validate-task.js'
import { record } from './record.js'
import type { Context } from './context.js'
export function editTask(ctx: Context, id: string, action: string, change: (task: Task) => object): Promise<Result<Task>> {
  return ctx.repository.transact(state => {
    const task = state.tasks.find(item => item.id === id)
    if (!task) return fail('not_found', 'Task does not exist')
    if (task.status === 'done' || task.status === 'canceled') return fail('conflict', 'Closed tasks cannot be changed')
    const parsed = parseTask({ ...task, ...change(task), updatedAt: ctx.clock.now() })
    if (!parsed.ok) return parsed
    state.tasks.splice(state.tasks.indexOf(task), 1, parsed.value)
    record(ctx, state, id, action)
    return parsed
  })
}
