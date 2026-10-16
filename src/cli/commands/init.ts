import { initialize } from '../../services/initialize.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx }) => {
  return initialize(ctx)
}
