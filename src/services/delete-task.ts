import { deleteEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const deleteTask = (ctx: Context, id: string) => deleteEntity(ctx, id, state => state.tasks, 'task.deleted')
