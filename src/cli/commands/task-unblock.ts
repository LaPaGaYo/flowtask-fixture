import { unblockTask } from '../../services/unblock-task.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, args }) => {
  return unblockTask(ctx, args[0] ?? '', args[1] ?? '')
}
