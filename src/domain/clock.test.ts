import { expect, test } from 'vitest'
import { clockAt } from './clock.js'
test('fixed clocks normalize instants and reject malformed input', () => {
  const result = clockAt('2024-01-01T00:00:00Z')
  expect(result.ok && result.value.now()).toBe('2024-01-01T00:00:00.000Z')
  expect(clockAt('tomorrow').ok).toBe(false)
})
