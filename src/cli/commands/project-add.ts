import { createProject } from '../../services/create-project.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, options }) => {
  return createProject(ctx, { name: options.name })
}
