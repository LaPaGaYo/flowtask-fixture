import { expect, test } from 'vitest'
import { exportProcess } from '../helpers/export-process.js'
import { workspace } from '../helpers/workspace.js'

test('launchServer directly starts the built stdio server, reports readiness and forwards SIGTERM with a zero shutdown code', async () => {
  const work = await workspace('launch-server-export')
  const program = `
    import { launchServer } from './dist/cli/launch-server.js'
    const before = [process.listenerCount('SIGINT'), process.listenerCount('SIGTERM')]
    const result = await launchServer({ data: process.argv[1], now: '2024-01-08T12:00:00.000Z', port: 0, stdio: true })
    const after = [process.listenerCount('SIGINT'), process.listenerCount('SIGTERM')]
    process.stderr.write(JSON.stringify({ result, before, after }) + '\\n')
    process.exitCode = result.ok ? 0 : 4
  `
  try {
    const child = await exportProcess(program, work.data)
    try {
      expect(child.ready).toEqual({ listening: true, transport: 'stdio' })
      await child.health()
    } finally {
      const stopped = await child.stop()
      expect(stopped.code).toBe(0)
      expect(stopped.wire).toContain('HTTP/1.1 200 OK')
      expect(stopped.wire).toContain('{"status":"ok","version":1}')
      expect(stopped.messages).toEqual([{ result: { ok: true, value: 'Server stopped' }, before: [0, 0], after: [0, 0] }])
    }
  } finally { await work.cleanup() }
})
