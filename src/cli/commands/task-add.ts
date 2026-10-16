import { createTask } from '../../services/create-task.js'
import { taskFields } from '../fields.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, options }) => {
  const input = taskFields(options)
  return input.ok ? createTask(ctx, input.value) : input
}
