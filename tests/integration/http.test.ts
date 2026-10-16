import { afterAll, beforeAll, expect, test } from 'vitest'
import { workspace } from '../helpers/workspace.js'
import { server } from '../helpers/server.js'
import { cli, parse } from '../helpers/cli.js'
let work: Awaited<ReturnType<typeof workspace>>
let app: Awaited<ReturnType<typeof server>>
beforeAll(async () => { work = await workspace('http'); app = await server(work.data) })
afterAll(async () => { if (app) expect((await app.stop()).code).toBe(0); await work.cleanup() })
test('built HTTP server serves deterministic health without real-time headers', async () => {
  const response = await app.request('/health')
  expect(response.status).toBe(200)
  expect(response.body).toEqual({ status: 'ok', version: 1 })
  expect(response.headers.get('date')).toBeNull()
})
test('HTTP and CLI share persisted tasks and injected clocks', async () => {
  const project = await app.request('/projects', 'POST', { name: 'Work' })
  const task = await app.request('/tasks', 'POST', { projectId: project.body.id, title: 'Repeat', recurrence: { kind: 'weekly', weekdays: [1, 5] } })
  expect(task.status).toBe(201)
  const done = await app.request(`/tasks/${task.body.id}/done`, 'POST', {}, '2024-01-12T09:00:00Z')
  expect(done.body).toMatchObject({ task: { updatedAt: '2024-01-12T09:00:00.000Z' }, nextTask: { dueDate: '2024-01-15' } })
  const listed = parse<unknown[]>((await cli(work.data, ['task', 'list'])).stdout)
  expect(listed).toHaveLength(2)
  expect((await app.request('/reports/counts')).body).toEqual({ todo: 1, doing: 0, done: 1, canceled: 0 })
})
test('concurrent HTTP mutations serialize without losing data or duplicating IDs', async () => {
  const results = await Promise.all(['Alpha', 'Beta', 'Gamma', 'Delta'].map(name => app.request('/tags', 'POST', { name })))
  expect(results.map(result => result.status)).toEqual([201, 201, 201, 201])
  expect(new Set(results.map(result => result.body.id)).size).toBe(4)
  expect((await app.request('/tags')).body).toHaveLength(4)
})
test('CRUD for tags and views survives HTTP serialization', async () => {
  const tag = await app.request('/tags', 'POST', { name: 'Temporary' })
  expect((await app.request(`/tags/${tag.body.id}`, 'PATCH', { name: 'Renamed' })).status).toBe(200)
  expect((await app.request(`/tags/${tag.body.id}`)).body).toMatchObject({ name: 'Renamed' })
  expect((await app.request(`/tags/${tag.body.id}`, 'DELETE')).status).toBe(200)
  const view = await app.request('/views', 'POST', { name: 'Ready', filter: { ready: true }, sort: 'priority' })
  expect((await app.request(`/views/${view.body.id}/run`)).body).toHaveLength(1)
  expect((await app.request(`/views/${view.body.id}`, 'PATCH', { name: 'Open' })).status).toBe(200)
  expect((await app.request(`/views/${view.body.id}`, 'DELETE')).status).toBe(200)
})
