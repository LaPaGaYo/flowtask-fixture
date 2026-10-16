import { archiveProject } from '../../services/archive-project.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, args }) => {
  return archiveProject(ctx, args[0] ?? '')
}
