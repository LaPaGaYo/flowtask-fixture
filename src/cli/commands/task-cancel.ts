import { cancelTask } from '../../services/cancel-task.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, args }) => {
  return cancelTask(ctx, args[0] ?? '')
}
