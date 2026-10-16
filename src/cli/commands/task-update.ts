import { updateTask } from '../../services/update-task.js'
import { taskFields } from '../fields.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, options, args }) => {
  const input = taskFields(options)
  return input.ok ? updateTask(ctx, args[0] ?? '', input.value) : input
}
