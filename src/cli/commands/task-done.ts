import { completeTask } from '../../services/complete-task.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, args }) => {
  return completeTask(ctx, args[0] ?? '')
}
