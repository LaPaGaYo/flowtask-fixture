import { editTask } from './edit-task.js'
import type { Context } from './context.js'
export const unblockTask = (ctx: Context, id: string, dependencyId: string) =>
  editTask(ctx, id, 'task.unblocked', task => ({ blockedBy: task.blockedBy.filter(value => value !== dependencyId) }))
