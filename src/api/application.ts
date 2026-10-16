import { createServer } from 'node:http'
import type { Context } from '../services/context.js'
import { dispatch } from './dispatch.js'
import { readBody } from './read-body.js'
import { errorResponse } from './error-response.js'
export function createHttpServer(ctx: Context) {
  return createServer(async (request, response) => {
    response.sendDate = false
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    try {
      const body = await readBody(request)
      const header = request.headers['x-flowtask-now']
      const result = !body.ok ? errorResponse(body.error) : Array.isArray(header)
        ? errorResponse({ code: 'validation', message: 'Expected one clock header' })
        : await dispatch(ctx, request.method ?? 'GET', request.url ?? '/', body.value, header)
      response.writeHead(result.status)
      response.end(`${JSON.stringify(result.body)}\n`)
    } catch {
      response.writeHead(500)
      response.end(`${JSON.stringify({ error: { code: 'storage', message: 'Request failed' } })}\n`)
    }
  })
}
