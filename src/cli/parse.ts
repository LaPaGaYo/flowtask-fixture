import { parseArgs } from 'node:util'
import { ok, fail } from '../domain/result.js'
export function parseArguments(args: string[]) {
  try {
    const parsed = parseArgs({ args, allowPositionals: true, strict: true, options: {
      data: { type: 'string' }, json: { type: 'boolean' }, now: { type: 'string' }, help: { type: 'boolean' },
      name: { type: 'string' }, project: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' },
      status: { type: 'string' }, priority: { type: 'string' }, due: { type: 'string' }, tags: { type: 'string' },
      'blocked-by': { type: 'string' }, recurrence: { type: 'string' }, filter: { type: 'string' }, sort: { type: 'string' },
      format: { type: 'string' }, file: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' },
      entity: { type: 'string' }, ready: { type: 'boolean' }, port: { type: 'string' }, stdio: { type: 'boolean' }
    } })
    const nested = ['project', 'task', 'tag', 'view'].includes(parsed.positionals[0] ?? '')
    return ok({ key: parsed.positionals.slice(0, nested ? 2 : 1).join(' '),
      args: parsed.positionals.slice(nested ? 2 : 1), options: parsed.values })
  } catch { return fail('usage', 'Invalid arguments; use --help') }
}
