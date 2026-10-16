import { createTag } from '../../services/create-tag.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, options }) => {
  return createTag(ctx, { name: options.name })
}
