import { expect, test } from 'vitest'
import { client, entity } from './test-helpers/client.js'
test('tags and views implement full CRUD including executing saved filters', async () => {
  const request = client()
  const tag = entity((await request('POST', '/tags', { name: 'urgent' })).body)
  expect((await request('GET', '/tags')).body).toMatchObject([{ id: tag.id }])
  expect((await request('GET', `/tags/${tag.id}`)).status).toBe(200)
  expect((await request('PATCH', `/tags/${tag.id}`, { name: 'later' })).status).toBe(200)
  const view = entity((await request('POST', '/views', { name: 'Ready', filter: { ready: true } })).body)
  expect((await request('GET', '/views')).body).toMatchObject([{ id: view.id }])
  expect((await request('GET', `/views/${view.id}`)).status).toBe(200)
  expect((await request('PATCH', `/views/${view.id}`, { name: 'Open' })).status).toBe(200)
  expect((await request('GET', `/views/${view.id}/run`)).body).toEqual([])
  expect((await request('DELETE', `/views/${view.id}`)).status).toBe(200)
  expect((await request('DELETE', `/tags/${tag.id}`)).status).toBe(200)
})
