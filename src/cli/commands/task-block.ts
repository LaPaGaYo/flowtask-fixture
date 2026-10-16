import { blockTask } from '../../services/block-task.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, args }) => {
  return blockTask(ctx, args[0] ?? '', args[1] ?? '')
}
