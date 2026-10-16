import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { resolve } from 'node:path'
import { Agent, request } from 'node:http'
import { Duplex } from 'node:stream'
import type { Socket } from 'node:net'
import { isRecord } from '../../src/domain/guards.js'
export async function server(data: string, entry: 'server' | 'cli' = 'server') {
  const child = spawn(process.execPath, [resolve(`dist/${entry}.js`), ...(entry === 'cli' ? ['serve'] : []),
    '--data', data, '--stdio', '--now', '2024-01-08T12:00:00.000Z'], { stdio: ['pipe', 'pipe', 'pipe'] })
  let stderr = ''
  let wire = ''
  child.stdout.on('data', (chunk: Buffer) => { wire += chunk.toString('utf8') })
  const closed = new Promise<number>((resolveExit, reject) => {
    child.once('error', reject)
    child.once('close', code => resolveExit(code ?? 1))
  })
  const lines = createInterface({ input: child.stderr })
  await new Promise<void>((resolveReady, reject) => {
    const onExit = () => reject(new Error(`Server exited before readiness: ${stderr}`))
    child.once('exit', onExit)
    child.once('error', reject)
    lines.once('line', line => {
      const message: unknown = JSON.parse(line)
      if (!isRecord(message) || message.transport !== 'stdio' || !message.listening) {
        stderr += line
        reject(new Error(`Invalid server readiness message: ${line}`))
        return
      }
      child.off('exit', onExit)
      resolveReady()
    })
  })
  lines.on('line', line => { stderr += `${line}\n` })
  const transport = Duplex.from({ readable: child.stdout, writable: child.stdin })
  const agent = new Agent({ keepAlive: true, maxSockets: 1 })
  // HTTP agents normally tune kernel sockets; these hooks retain a pipe instead.
  agent.createConnection = () => transport as Socket
  agent.keepSocketAlive = () => true
  Object.assign(transport, { ref: () => transport })
  const raw = (path: string, method: string, body?: string, headers: Record<string, string> = {}) =>
    new Promise<{ status: number; headers: Headers; body: Record<string, unknown> }>((resolveResponse, reject) => {
      const req = request({ path, method, agent, headers }, response => {
        let text = ''
        response.setEncoding('utf8').on('data', (chunk: string) => { text += chunk })
        response.once('error', reject)
        response.once('end', () => {
          try {
            resolveResponse({ status: response.statusCode ?? 500,
              headers: new Headers(Object.entries(response.headers).map(([key, value]) => [key, String(value)])),
              body: JSON.parse(text) as Record<string, unknown> })
          } catch (error) { reject(error) }
        })
      })
      req.once('error', reject)
      req.end(body)
    })
  return {
    raw,
    request: (path: string, method = 'GET', body?: unknown, now = '2024-01-08T12:00:00.000Z') =>
      raw(path, method, body === undefined ? undefined : JSON.stringify(body), { 'Content-Type': 'application/json', 'X-FlowTask-Now': now }),
    stop: async () => {
      child.kill('SIGTERM')
      const code = await closed
      agent.destroy(); lines.close()
      return { code, stderr, wire }
    }
  }
}
