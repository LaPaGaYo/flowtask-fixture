import type { IncomingMessage } from 'node:http'
import { fail, ok, type Result } from '../domain/result.js'
export async function readBody(request: IncomingMessage): Promise<Result<unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    size += buffer.length
    if (size > 1_048_576) return fail('validation', 'Request body exceeds 1 MiB')
    chunks.push(buffer)
  }
  if (size === 0) return ok({})
  if (!request.headers['content-type']?.startsWith('application/json')) return fail('validation', 'Content-Type must be application/json')
  try { return ok(JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown) }
  catch { return fail('validation', 'Invalid JSON request body') }
}
