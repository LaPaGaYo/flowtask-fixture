import { expect, test } from 'vitest'
import { decode, encode } from './codec.js'
import { emptySnapshot } from './snapshot.js'
test('canonical JSON round trips byte for byte', () => {
  const bytes = encode(emptySnapshot())
  const result = decode(bytes)
  expect(result.ok && encode(result.value)).toBe(bytes)
  expect(bytes.endsWith('\n')).toBe(true)
  expect(decode('{').ok).toBe(false)
})
