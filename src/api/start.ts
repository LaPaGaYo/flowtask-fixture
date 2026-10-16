import { parseArgs } from 'node:util'
import type { Server } from 'node:http'
import { ok, fail, type Result } from '../domain/result.js'
import { createContext } from '../services/runtime.js'
import { createHttpServer } from './application.js'
import { attachStdio } from './stdio.js'
export async function startServer(args: string[]): Promise<Result<{ server: Server; stdio: boolean; close(): void }>> {
  let options: { data?: string; now?: string; port?: string; stdio?: boolean }
  try {
    options = parseArgs({ args, options: { data: { type: 'string' }, now: { type: 'string' }, port: { type: 'string' }, stdio: { type: 'boolean' } } }).values
  } catch { return fail('usage', 'Expected --data <file> --now <ISO UTC timestamp> --port <number>') }
  const port = Number(options.port ?? 3000)
  if (!Number.isInteger(port) || port < 0 || port > 65535) return fail('usage', 'Port must be between 0 and 65535')
  const ctx = createContext(options.data ?? '.flowtask-data/store.json', options.now)
  if (!ctx.ok) return ctx
  const server = createHttpServer(ctx.value)
  if (options.stdio) {
    const connection = attachStdio(server, process.stdin, process.stdout)
    return ok({ server, stdio: true, close: () => { connection.destroy(); server.close() } })
  }
  return new Promise(resolve => {
    const onError = () => { resolve(fail('storage', 'Cannot listen on requested port')) }
    server.once('error', onError)
    server.listen(port, '127.0.0.1', () => {
      server.off('error', onError)
      resolve(ok({ server, stdio: false, close: () => { server.close() } }))
    })
  })
}
