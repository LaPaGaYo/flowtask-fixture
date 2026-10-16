import { parseProject } from '../domain/validate-entities.js'
import { createEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const createProject = (ctx: Context, input: unknown) =>
  createEntity(ctx, input, ['name'], parseProject, state => state.projects, 'project.created', { archived: false })
