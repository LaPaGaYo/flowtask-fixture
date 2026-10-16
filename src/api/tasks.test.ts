import { expect, test } from 'vitest'
import { client, entity } from './test-helpers/client.js'
test('task CRUD, dependencies, injected time and completion are consistent', async () => {
  const request = client()
  const projectId = entity((await request('POST', '/projects', { name: 'Work' })).body).id
  const a = entity((await request('POST', '/tasks', { projectId, title: 'A' })).body)
  const b = entity((await request('POST', '/tasks', { projectId, title: 'B', recurrence: { kind: 'daily' } })).body)
  expect((await request('POST', `/tasks/${b.id}/block`, { dependencyId: a.id })).status).toBe(200)
  expect((await request('POST', `/tasks/${b.id}/done`)).status).toBe(409)
  expect((await request('GET', '/tasks?ready=true')).body).toMatchObject([{ id: a.id }])
  expect((await request('PATCH', `/tasks/${a.id}`, { priority: 'p1' })).status).toBe(200)
  expect((await request('GET', `/tasks/${a.id}`)).body).toMatchObject({ priority: 'p1' })
  expect((await request('POST', `/tasks/${a.id}/done`, {}, '2024-02-01T12:00:00Z')).body).toMatchObject({ task: { updatedAt: '2024-02-01T12:00:00.000Z' } })
  expect((await request('POST', `/tasks/${b.id}/unblock`, { dependencyId: a.id })).status).toBe(200)
  expect((await request('POST', `/tasks/${b.id}/cancel`)).status).toBe(200)
  expect((await request('DELETE', `/tasks/${b.id}`)).status).toBe(200)
})
