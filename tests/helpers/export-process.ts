import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'

// Invoke an exported built function in isolation; no CLI dispatcher is involved.
export async function exportProcess(program: string, data: string) {
  const child = spawn(process.execPath, ['--input-type=module', '--eval', program, data], { stdio: ['pipe', 'pipe', 'pipe'] })
  let wire = ''
  const messages: unknown[] = []
  child.stdout.setEncoding('utf8').on('data', (chunk: string) => { wire += chunk })
  const closed = new Promise<number | null>((resolve, reject) => {
    child.once('error', reject)
    child.once('close', resolve)
  })
  const lines = createInterface({ input: child.stderr })
  const ready = await new Promise<unknown>((resolve, reject) => {
    const onExit = () => reject(new Error('Export process exited before readiness'))
    child.once('exit', onExit)
    child.once('error', reject)
    lines.once('line', line => {
      child.off('exit', onExit)
      try { resolve(JSON.parse(line) as unknown) }
      catch (error) { reject(error) }
    })
  }).catch(async error => {
    child.kill('SIGTERM')
    await closed
    lines.close()
    throw error
  })
  lines.on('line', line => { messages.push(JSON.parse(line) as unknown) })
  return { ready,
    health: () => new Promise<void>((resolve, reject) => {
      const onExit = () => reject(new Error('Export process exited before the HTTP response'))
      const onData = () => {
        if (!wire.endsWith('0\r\n\r\n')) return
        child.stdout.off('data', onData)
        child.off('exit', onExit)
        resolve()
      }
      child.once('exit', onExit)
      child.stdout.on('data', onData)
      child.stdin.write('GET /health HTTP/1.1\r\nHost: localhost\r\nConnection: keep-alive\r\n\r\n')
    }),
    stop: async () => {
      child.kill('SIGTERM')
      const code = await closed
      lines.close()
      return { code, wire, messages }
    }
  }
}
