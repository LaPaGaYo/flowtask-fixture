import { parseTag } from '../domain/validate-entities.js'
import { createEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const createTag = (ctx: Context, input: unknown) =>
  createEntity(ctx, input, ['name'], parseTag, state => state.tags, 'tag.created', {})
