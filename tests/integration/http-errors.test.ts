import { afterAll, beforeAll, expect, test } from 'vitest'
import { writeFile, rm } from 'node:fs/promises'
import { workspace } from '../helpers/workspace.js'
import { server } from '../helpers/server.js'
let work: Awaited<ReturnType<typeof workspace>>
let app: Awaited<ReturnType<typeof server>>
beforeAll(async () => { work = await workspace('http-errors'); app = await server(work.data) })
afterAll(async () => { if (app) expect((await app.stop()).code).toBe(0); await work.cleanup() })
test('malformed requests and clocks get JSON error envelopes', async () => {
  const response = await app.raw('/tasks', 'POST', '{', { 'Content-Type': 'application/json' })
  expect(response.status).toBe(400)
  expect(response.body).toHaveProperty('error.code', 'validation')
  expect((await app.request('/health', 'GET', undefined, 'yesterday')).status).toBe(400)
  expect((await app.request('/unknown')).status).toBe(404)
  expect((await app.request('/health', 'DELETE')).status).toBe(405)
  expect((await app.request('/tasks/%ZZ')).status).toBe(400)
  const plain = await app.raw('/tasks', 'POST', '{}')
  expect(plain.status).toBe(400)
})
test('corrupt data and competing writer lock return storage envelopes', async () => {
  await writeFile(work.data, '{')
  expect((await app.request('/projects')).body).toHaveProperty('error.code', 'storage')
  await rm(work.data)
  await writeFile(`${work.data}.lock`, '')
  expect((await app.request('/projects', 'POST', { name: 'Blocked' })).status).toBe(500)
  await rm(`${work.data}.lock`)
  expect((await app.request('/projects', 'POST', { name: 'Unblocked' })).status).toBe(201)
})

test('oversized input and invalid enum shapes are rejected without crashing', async () => {
  const response = await app.raw('/tasks', 'POST', JSON.stringify({ title: 'x'.repeat(1_048_576) }), { 'Content-Type': 'application/json' })
  expect(response.status).toBe(400)
  expect(response.body).toHaveProperty('error.code', 'validation')
  expect((await app.request('/health')).status).toBe(200)
  expect((await app.request('/views', 'POST', { name: 'Bad', filter: {}, sort: ['priority'] })).status).toBe(400)
})
