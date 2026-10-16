import { expect, test } from 'vitest'
import { client } from './test-helpers/client.js'
import { dispatch } from './dispatch.js'
import { context } from '../services/test-helpers/context.js'
import { fail } from '../domain/result.js'
test('unknown routes, wrong methods, malformed IDs and invalid clocks are envelopes', async () => {
  const request = client()
  expect((await request('GET', '/missing')).status).toBe(404)
  expect((await request('PUT', '/health')).status).toBe(405)
  expect((await request('GET', '/tasks/%ZZ')).status).toBe(400)
  expect((await request('GET', '/health', {}, 'invalid')).status).toBe(400)
  expect((await request('POST', '/tasks', null)).body).toHaveProperty('error.code', 'validation')
  expect((await request('GET', '/tasks?ready=maybe')).status).toBe(400)
  expect((await request('GET', '/tasks?unknown=true')).status).toBe(400)
})
test('storage errors map to 500', async () => {
  const ctx = context()
  ctx.repository = { read: () => Promise.resolve(fail('storage', 'Cannot read')),
    transact: () => Promise.resolve(fail('storage', 'Cannot write')) }
  expect((await dispatch(ctx, 'GET', '/projects', {})).status).toBe(500)
})
