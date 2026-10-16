import { expect, test } from 'vitest'
import { client, entity } from './test-helpers/client.js'
test('project CRUD and health expose JSON values', async () => {
  const request = client()
  expect(await request('GET', '/health')).toEqual({ status: 200, body: { status: 'ok', version: 1 } })
  const created = await request('POST', '/projects', { name: 'Work' })
  expect(created.status).toBe(201)
  const id = entity(created.body).id
  expect((await request('GET', '/projects')).body).toMatchObject([{ id }])
  expect((await request('GET', `/projects/${id}`)).body).toMatchObject({ name: 'Work' })
  expect((await request('PATCH', `/projects/${id}`, { name: 'Home', archived: true })).body).toMatchObject({ name: 'Home', archived: true })
  expect((await request('DELETE', `/projects/${id}`)).status).toBe(200)
  expect((await request('GET', `/projects/${id}`)).status).toBe(404)
})
