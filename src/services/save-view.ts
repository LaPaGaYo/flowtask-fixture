import { parseView } from '../domain/validate-view.js'
import { createEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const saveView = (ctx: Context, input: unknown) =>
  createEntity(ctx, input, ['name', 'filter', 'sort'], parseView, state => state.views, 'view.created', { filter: {}, sort: 'priority' })
