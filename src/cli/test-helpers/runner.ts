import { context } from '../../services/test-helpers/context.js'
import { ok } from '../../domain/result.js'
import { runCli } from '../run.js'
export function runner() {
  const ctx = context()
  return { ctx, run: (args: string[]) => runCli(args, {
    context: () => ok(ctx), read: () => Promise.resolve('invalid'), serve: () => Promise.resolve(ok({ listening: true }))
  }) }
}
export function output(text: string): Record<string, unknown> { return JSON.parse(text) as Record<string, unknown> }
