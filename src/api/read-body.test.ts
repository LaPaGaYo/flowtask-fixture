import { expect, test } from 'vitest'
import { IncomingMessage } from 'node:http'
import { Socket } from 'node:net'
import { readBody } from './read-body.js'

async function body(chunks: (string | Buffer)[], contentType?: string) {
  const socket = new Socket()
  const request = new IncomingMessage(socket)
  if (contentType !== undefined) request.headers['content-type'] = contentType
  for (const chunk of chunks) request.push(chunk)
  request.push(null)
  try { return await readBody(request) }
  finally { request.destroy(); socket.destroy() }
}

test('readBody accepts empty bodies and assembles split UTF-8 JSON with charset parameters', async () => {
  expect(await body([])).toEqual({ ok: true, value: {} })
  const bytes = Buffer.from('{"title":"café"}')
  expect(await body([bytes.subarray(0, 14), bytes.subarray(14)], 'application/json; charset=utf-8'))
    .toEqual({ ok: true, value: { title: 'café' } })
  expect(await body(['null'], 'application/json')).toEqual({ ok: true, value: null })
})

test('readBody rejects non-JSON content types and malformed JSON', async () => {
  expect(await body(['{}'])).toEqual({ ok: false, error: { code: 'validation', message: 'Content-Type must be application/json' } })
  expect(await body(['{}'], 'text/plain')).toMatchObject({ ok: false, error: { code: 'validation' } })
  expect(await body(['{'], 'application/json')).toEqual({ ok: false, error: { code: 'validation', message: 'Invalid JSON request body' } })
})

test('readBody accepts exactly one MiB and rejects one byte more', async () => {
  const text = 'x'.repeat(1_048_574)
  expect(await body([JSON.stringify(text)], 'application/json')).toEqual({ ok: true, value: text })
  expect(await body([JSON.stringify(`${text}x`)], 'application/json'))
    .toEqual({ ok: false, error: { code: 'validation', message: 'Request body exceeds 1 MiB' } })
})
