import type { Context } from './context.js'
import { updateProject } from './update-project.js'
export const archiveProject = (ctx: Context, id: string) => updateProject(ctx, id, { archived: true })
