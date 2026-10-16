import { deleteEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const deleteProject = (ctx: Context, id: string) =>
  deleteEntity(ctx, id, state => state.projects, 'project.deleted')
