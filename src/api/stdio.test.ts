import { expect, test } from 'vitest'
import { Agent, request, type IncomingHttpHeaders } from 'node:http'
import { Duplex, PassThrough } from 'node:stream'
import type { Socket } from 'node:net'
import { attachStdio } from './stdio.js'
import { createHttpServer } from './application.js'
import { context, value } from '../services/test-helpers/context.js'

function application() {
  const ctx = context()
  const server = createHttpServer(ctx)
  const input = new PassThrough()
  const output = new PassThrough()
  const connection = attachStdio(server, input, output)
  const client = Duplex.from({ readable: output, writable: input })
  const agent = new Agent({ keepAlive: true, maxSockets: 1 })
  agent.createConnection = () => client as Socket
  agent.keepSocketAlive = () => true
  Object.assign(client, { ref: () => client })
  const send = (path: string, method = 'GET', body?: string, now = ctx.clock.now()) =>
    new Promise<{ status: number; headers: IncomingHttpHeaders; body: unknown }>((resolve, reject) => {
      const req = request({ path, method, agent, headers: { 'Content-Type': 'application/json', 'X-FlowTask-Now': now } }, response => {
        let text = ''
        response.setEncoding('utf8').on('data', (chunk: string) => { text += chunk })
        response.once('error', reject)
        response.once('end', () => {
          try { resolve({ status: response.statusCode ?? 0, headers: response.headers, body: JSON.parse(text) as unknown }) }
          catch (error) { reject(error) }
        })
      })
      req.once('error', reject)
      req.end(body)
    })
  return { ctx, server, connection, send, close: () => {
    agent.destroy(); connection.destroy(); client.destroy(); input.destroy(); output.destroy(); server.close()
  } }
}

test('attachStdio connects createHttpServer to pipes without listening and can shut down the connection', async () => {
  const app = application()
  try {
    expect(app.server.listening).toBe(false)
    const response = await app.send('/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok', version: 1 })
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.headers.date).toBeUndefined()
  } finally { app.close() }
  expect(app.connection.destroyed).toBe(true)
})

test('createHttpServer persists requests in MemoryRepository and applies the request clock only to that request', async () => {
  const app = application()
  try {
    expect(await app.send('/projects', 'POST', '{"name":"Work"}')).toMatchObject({ status: 201, body: { id: 'id-000001' } })
    const now = '2024-02-29T12:00:00.000Z'
    expect(await app.send('/tasks', 'POST', '{"projectId":"id-000001","title":"One"}', now))
      .toMatchObject({ status: 201, body: { title: 'One', createdAt: now, updatedAt: now } })
    expect(value(await app.ctx.repository.read()).tasks).toMatchObject([{ title: 'One', createdAt: now }])
    expect(app.ctx.clock.now()).toBe('2024-01-08T12:00:00.000Z')
  } finally { app.close() }
})

test('createHttpServer returns the shared error envelope for malformed JSON and unknown paths', async () => {
  const app = application()
  try {
    expect(await app.send('/tasks', 'POST', '{'))
      .toMatchObject({ status: 400, body: { error: { code: 'validation', message: 'Invalid JSON request body' } } })
    expect(await app.send('/missing'))
      .toMatchObject({ status: 404, body: { error: { code: 'not_found', message: 'Route does not exist' } } })
  } finally { app.close() }
})
