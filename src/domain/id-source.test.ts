import { expect, test } from 'vitest'
import { sequentialIds } from './id-source.js'
test('IDs are deterministic and skip existing values', () => {
  const ids = sequentialIds()
  expect(ids.next([])).toBe('id-000001')
  expect(ids.next(['id-000001', 'id-000003', 'custom'])).toBe('id-000004')
})

test('IDs remain exact beyond Number safe integer range', () => {
  expect(sequentialIds().next(['id-9007199254740992'])).toBe('id-9007199254740993')
})
