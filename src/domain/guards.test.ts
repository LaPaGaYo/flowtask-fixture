import { expect, test } from 'vitest'
import { isRecord, nonempty, strings } from './guards.js'
test('unknown values are narrowed without coercion', () => {
  expect(isRecord({})).toBe(true)
  expect(isRecord(null)).toBe(false)
  expect(isRecord([])).toBe(false)
  expect(nonempty(' x ')).toBe(true)
  expect(nonempty(' ')).toBe(false)
  expect(strings(['x'])).toBe(true)
  expect(strings([''])).toBe(false)
  expect(strings([1])).toBe(false)
})
