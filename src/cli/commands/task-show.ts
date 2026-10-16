import { getEntity } from '../../services/read-entities.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, args }) => {
  return getEntity(ctx, 'tasks', args[0] ?? '')
}
