import { afterAll, beforeAll, expect, test } from 'vitest'
import { workspace } from '../helpers/workspace.js'
import { server } from '../helpers/server.js'
import { executable } from '../helpers/cli.js'
let work: Awaited<ReturnType<typeof workspace>>
let app: Awaited<ReturnType<typeof server>>
beforeAll(async () => { work = await workspace('serve'); app = await server(work.data, 'cli') })
afterAll(async () => {
  if (app) {
    const stopped = await app.stop()
    expect(stopped).toMatchObject({ code: 0, stderr: '' })
    expect(stopped.wire).not.toContain('Server stopped')
    expect(stopped.wire.endsWith('0\r\n\r\n')).toBe(true)
  }
  await work.cleanup()
})
test('CLI serve launches the built HTTP server and forwards shutdown', async () => {
  expect((await app.request('/health')).status).toBe(200)
})
test('standalone server rejects malformed options without listening', async () => {
  const results = await Promise.all([['--port', '-1'], ['--unknown'], ['--now', 'invalid']].map(args => executable('server', args)))
  expect(results.map(result => result.code)).toEqual([2, 2, 3])
})
