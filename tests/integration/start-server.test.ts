import { expect, test } from 'vitest'
import { exportProcess } from '../helpers/export-process.js'
import { workspace } from '../helpers/workspace.js'

test('startServer directly exposes a ready stdio transport and closes it with a zero shutdown code', async () => {
  const work = await workspace('start-server-export')
  const program = `
    import { startServer } from './dist/api/start.js'
    const result = await startServer(['--stdio', '--data', process.argv[1], '--now', '2024-01-08T12:00:00.000Z', '--port', '0'])
    if (!result.ok) throw new Error(result.error.message)
    const { server, stdio, close } = result.value
    process.once('SIGTERM', () => {
      close()
      process.stderr.write(JSON.stringify({ closed: true, listening: server.listening }) + '\\n')
    })
    process.stderr.write(JSON.stringify({ stdio, listening: server.listening, address: server.address() }) + '\\n')
  `
  try {
    const child = await exportProcess(program, work.data)
    try {
      expect(child.ready).toEqual({ stdio: true, listening: false, address: null })
      await child.health()
    } finally {
      const stopped = await child.stop()
      expect(stopped.code).toBe(0)
      expect(stopped.wire).toContain('HTTP/1.1 200 OK')
      expect(stopped.wire).toContain('{"status":"ok","version":1}')
      expect(stopped.messages).toEqual([{ closed: true, listening: false }])
    }
  } finally { await work.cleanup() }
})
