import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
export async function executable(entry: 'cli' | 'server', args: string[]) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolveResult, reject) => {
    const child = spawn(process.execPath, [resolve(`dist/${entry}.js`), ...args], { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk })
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk })
    child.once('error', reject)
    child.once('close', code => resolveResult({ code: code ?? 1, stdout, stderr }))
  })
}
export const cli = (data: string, args: string[], now = '2024-01-08T12:00:00.000Z') =>
  executable('cli', [...args, '--data', data, '--now', now, '--json'])
export function parse<T = Record<string, unknown>>(text: string): T { return JSON.parse(text) as T }
