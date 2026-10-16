import { expect, test } from 'vitest'
import { ok, fail } from './result.js'
test('results carry values or structured errors', () => {
  expect(ok(42)).toEqual({ ok: true, value: 42 })
  expect(fail('validation', 'bad')).toEqual({ ok: false, error: { code: 'validation', message: 'bad' } })
})
