import { expect, test } from 'vitest'
import { isDate, isTimestamp, addDays, compareText } from './date.js'
test('validates calendar dates and UTC instants', () => {
  expect(isDate('2024-02-29')).toBe(true)
  for (const value of ['2025-02-29', '2024-13-01', '', null]) expect(isDate(value)).toBe(false)
  expect(isTimestamp('2024-01-01T00:00:00.000Z')).toBe(true)
  expect(isTimestamp('2024-02-30T00:00:00Z')).toBe(false)
  expect(addDays('2024-02-28', 2)).toBe('2024-03-01')
  expect(compareText('a', 'b')).toBe(-1)
  expect(compareText('a', 'a')).toBe(0)
})

test('extended years remain complete so overflow can be rejected by validation', () => {
  expect(addDays('9999-12-31', 1)).toBe('+010000-01-01')
})
