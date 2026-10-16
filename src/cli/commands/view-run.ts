import { runView } from '../../services/run-view.js'
import type { Command } from '../types.js'
export const command: Command = async ({ ctx, args }) => {
  return runView(ctx, args[0] ?? '')
}
