import { importData } from '../../services/import-data.js'
import { fail } from '../../domain/result.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, options, read }) => {
  if (typeof options.file !== 'string') return fail('usage', 'Import requires --file')
  return importData(ctx, await read(options.file), String(options.format ?? 'json'))
}
