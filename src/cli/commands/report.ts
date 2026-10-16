import { runReport } from '../../services/run-report.js'
import type { Command } from '../types.js'
import { rangeFields } from '../fields.js'
export const command: Command = async ({ ctx, args, options }) => {
  return runReport(ctx, args[0] ?? '', rangeFields(options))
}
