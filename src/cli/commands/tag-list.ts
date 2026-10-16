import { listEntities } from '../../services/read-entities.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx }) => {
  return listEntities(ctx, 'tags')
}
