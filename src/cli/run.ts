import { fail, type Result } from '../domain/result.js'
import { parseArguments } from './parse.js'
import { commands } from './commands.js'
import { formatOutput } from './format.js'
import { help } from './help.js'
import type { CliDependencies } from './types.js'
export interface CliResult { exitCode: number; stdout: string; stderr: string }
function render(result: Result<unknown>, json: boolean): CliResult {
  if (result.ok) return { exitCode: 0, stdout: formatOutput(result.value, json), stderr: '' }
  const exitCode = result.error.code === 'usage' ? 2 : result.error.code === 'storage' ? 4 : 3
  return { exitCode, stdout: '', stderr: json ? `${JSON.stringify({ error: result.error })}\n` : `${result.error.code}: ${result.error.message}\n` }
}
export async function runCli(argv: string[], deps: CliDependencies): Promise<CliResult> {
  const parsed = parseArguments(argv)
  const json = argv.includes('--json')
  if (!parsed.ok) return render(parsed, json)
  const { key, args, options } = parsed.value
  if (options.help) return { exitCode: 0, stdout: help(), stderr: '' }
  const spec = commands()[key]
  if (!spec || args.length !== spec.arguments || Object.keys(options).some(option => !['data', 'json', 'now'].includes(option) && !spec.options.includes(option))) {
    return render(fail('usage', 'Unknown command, option, or argument count; use --help'), json)
  }
  const ctx = deps.context(options.data ?? '.flowtask-data/store.json', options.now ?? '2000-01-01T00:00:00.000Z')
  if (!ctx.ok) return render(ctx, json)
  try {
    const result = await spec.command({ ctx: ctx.value, args, options, read: deps.read, serve: deps.serve })
    if (key === 'serve' && options.stdio && result.ok) return { exitCode: 0, stdout: '', stderr: '' }
    if (key === 'export' && (options.format ?? 'json') === 'json' && result.ok && typeof result.value === 'string') {
      return { exitCode: 0, stdout: result.value, stderr: '' }
    }
    return render(result, json)
  }
  catch { return render(fail('storage', 'Cannot read input or execute command'), json) }
}
