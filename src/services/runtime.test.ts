import { expect, test } from 'vitest'
import { createContext } from './runtime.js'
import { JsonFileRepository } from '../storage/json-file-repository.js'
import { value } from './test-helpers/context.js'

test('createContext wires a file repository, fixed clock and independent deterministic IDs', () => {
  const first = value(createContext('unused.json', '2024-02-29T12:00:00Z'))
  const second = value(createContext('unused.json'))
  expect(first.repository).toBeInstanceOf(JsonFileRepository)
  expect(first.repository).not.toBe(second.repository)
  expect(first.clock.now()).toBe('2024-02-29T12:00:00.000Z')
  expect(second.clock.now()).toBe('2000-01-01T00:00:00.000Z')
  expect(first.ids.next(['id-000008'])).toBe('id-000009')
  expect(second.ids.next([])).toBe('id-000001')
})

test.each(['', 'invalid', '2024-02-30T00:00:00.000Z'])('createContext rejects an invalid clock: %s', now => {
  expect(createContext('unused.json', now)).toEqual({ ok: false, error: { code: 'validation', message: 'Clock must be an ISO UTC timestamp' } })
})
