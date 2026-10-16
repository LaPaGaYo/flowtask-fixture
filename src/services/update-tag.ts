import { parseTag } from '../domain/validate-entities.js'
import { updateEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const updateTag = (ctx: Context, id: string, input: unknown) =>
  updateEntity(ctx, id, input, ['name'], parseTag, state => state.tags, 'tag.updated')
