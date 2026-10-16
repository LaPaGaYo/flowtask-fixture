import { saveView } from '../../services/save-view.js'
import { filterFields } from '../fields.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, options }) => {
  const filter = filterFields(options)
  return filter.ok ? saveView(ctx, { name: options.name, filter: filter.value, sort: options.sort ?? 'priority' }) : filter
}
