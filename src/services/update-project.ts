import { parseProject } from '../domain/validate-entities.js'
import { updateEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const updateProject = (ctx: Context, id: string, input: unknown) =>
  updateEntity(ctx, id, input, ['name', 'archived'], parseProject, state => state.projects, 'project.updated')
