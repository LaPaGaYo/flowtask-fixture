import { listTasks } from '../../services/list-tasks.js'
import type { Command } from '../types.js'
import { filterFields } from '../fields.js'
export const command: Command = async ({ ctx, options }) => {
  const filter = filterFields(options)
  if (!filter.ok) return filter
  return listTasks(ctx, filter.value, options.sort ?? 'priority')
}
