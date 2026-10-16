import { expect, test } from 'vitest'
import { startServer } from './start.js'

test.each(['-1', '65536', '1.5', 'invalid'])('startServer rejects invalid port %s before opening a transport', async port => {
  expect(await startServer([`--port=${port}`])).toEqual({ ok: false, error: { code: 'usage', message: 'Port must be between 0 and 65535' } })
})

test('startServer reports malformed options and invalid clocks as typed errors', async () => {
  expect(await startServer(['--unknown'])).toMatchObject({ ok: false, error: { code: 'usage' } })
  expect(await startServer(['--data'])).toMatchObject({ ok: false, error: { code: 'usage' } })
  expect(await startServer(['--stdio', '--now', 'invalid']))
    .toEqual({ ok: false, error: { code: 'validation', message: 'Clock must be an ISO UTC timestamp' } })
})
