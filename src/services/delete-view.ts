import { deleteEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const deleteView = (ctx: Context, id: string) =>
  deleteEntity(ctx, id, state => state.views, 'view.deleted')
