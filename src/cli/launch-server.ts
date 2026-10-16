import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { ok, fail, type Result } from '../domain/result.js'
import type { ServerOptions } from './types.js'
export function launchServer(options: ServerOptions): Promise<Result<unknown>> {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [fileURLToPath(new URL('../server.js', import.meta.url)),
      '--data', options.data, '--now', options.now, '--port', String(options.port), ...(options.stdio ? ['--stdio'] : [])], { stdio: 'inherit' })
    const stop = () => { child.kill('SIGTERM') }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
    const cleanup = () => { process.off('SIGINT', stop); process.off('SIGTERM', stop) }
    child.once('error', () => { cleanup(); resolve(fail('storage', 'Cannot start server')) })
    child.once('exit', code => { cleanup(); resolve(code === 0 ? ok('Server stopped') : fail('storage', 'Server exited unsuccessfully')) })
  })
}
