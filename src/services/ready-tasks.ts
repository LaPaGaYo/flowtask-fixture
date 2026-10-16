import type { Context } from './context.js'
import { listTasks } from './list-tasks.js'
export const readyTasks = (ctx: Context) => listTasks(ctx, { ready: true }, 'priority')
