import { exportData } from '../../services/export-data.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, options }) => {
  return exportData(ctx, String(options.format ?? 'json'))
}
