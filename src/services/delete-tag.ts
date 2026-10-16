import { deleteEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const deleteTag = (ctx: Context, id: string) =>
  deleteEntity(ctx, id, state => state.tags, 'tag.deleted')
