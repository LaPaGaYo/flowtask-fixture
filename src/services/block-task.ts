import { editTask } from './edit-task.js'
import type { Context } from './context.js'
export const blockTask = (ctx: Context, id: string, dependencyId: string) =>
  editTask(ctx, id, 'task.blocked', task => ({ blockedBy: [...new Set([...task.blockedBy, dependencyId])] }))
