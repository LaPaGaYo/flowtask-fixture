import { editTask } from './edit-task.js'
import type { Context } from './context.js'
export const cancelTask = (ctx: Context, id: string) => editTask(ctx, id, 'task.canceled', () => ({ status: 'canceled' }))
