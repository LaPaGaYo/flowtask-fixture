import { parseView } from '../domain/validate-view.js'
import { updateEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const updateView = (ctx: Context, id: string, input: unknown) =>
  updateEntity(ctx, id, input, ['name', 'filter', 'sort'], parseView, state => state.views, 'view.updated')
