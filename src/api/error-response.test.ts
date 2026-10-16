import { expect, test } from 'vitest'
import { errorResponse } from './error-response.js'
import type { ErrorCode } from '../domain/result.js'

test.each<[ErrorCode, number]>([
  ['validation', 400], ['usage', 400], ['not_found', 404], ['conflict', 409],
  ['blocked', 409], ['cycle', 409], ['storage', 500]
])('errorResponse maps %s to HTTP %i with the shared envelope', (code, status) => {
  for (const message of ['', 'Specific failure']) {
    expect(errorResponse({ code, message })).toEqual({ status, body: { error: { code, message } } })
  }
})
