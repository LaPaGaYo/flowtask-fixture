import { fail } from '../../domain/result.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, options, serve }) => {
  const port = Number(options.port ?? 3000)
  if (!Number.isInteger(port) || port < 0 || port > 65535) return fail('usage', 'Port must be between 0 and 65535')
  return serve({ data: String(options.data ?? '.flowtask-data/store.json'), now: ctx.clock.now(), port, stdio: options.stdio === true })
}
