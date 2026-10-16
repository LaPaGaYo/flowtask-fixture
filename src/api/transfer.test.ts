import { expect, test } from 'vitest'
import { client, entity } from './test-helpers/client.js'
test('reports, exports, imports and activity use consistent envelopes', async () => {
  const request = client()
  await request('POST', '/projects', { name: 'Work' })
  expect((await request('GET', '/reports/counts')).body).toMatchObject({ todo: 0 })
  expect((await request('GET', '/reports/completion-per-day?from=2024-01-08&to=2024-01-08')).status).toBe(200)
  const exported = entity((await request('GET', '/export?format=csv')).body)
  expect(exported.content).toContain('kind,payload')
  expect((await request('POST', '/import', exported)).status).toBe(200)
  expect((await request('GET', '/activity')).body).toHaveLength(2)
  expect((await request('POST', '/import', { content: 123 })).status).toBe(400)
})
