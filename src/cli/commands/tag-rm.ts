import { deleteTag } from '../../services/delete-tag.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, args }) => {
  return deleteTag(ctx, args[0] ?? '')
}
