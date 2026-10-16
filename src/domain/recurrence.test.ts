import { expect, test } from 'vitest'
import { parseRecurrence, nextOccurrence } from './recurrence.js'
test('validates rules without exceptions', () => {
  for (const value of [{ kind: 'interval', days: 0 }, { kind: 'weekly', weekdays: [] }, { kind: 'monthly', day: 32 }, { kind: 'other' }]) {
    expect(parseRecurrence(value).ok).toBe(false)
  }
  expect(parseRecurrence(null)).toEqual({ ok: true, value: null })
  expect(parseRecurrence({ kind: 'weekly', weekdays: [5, 1, 5] })).toEqual({ ok: true, value: { kind: 'weekly', weekdays: [1, 5] } })
})
test('advances daily, weekly, interval and clamped monthly dates', () => {
  expect(nextOccurrence({ kind: 'daily' }, '2024-02-28', '2024-02-28')).toBe('2024-02-29')
  expect(nextOccurrence({ kind: 'weekly', weekdays: [1, 5] }, '2024-01-05', '2024-01-05')).toBe('2024-01-08')
  expect(nextOccurrence({ kind: 'interval', days: 3 }, '2024-01-01', '2024-01-08')).toBe('2024-01-10')
  expect(nextOccurrence({ kind: 'monthly', day: 31 }, '2024-01-31', '2024-01-31')).toBe('2024-02-29')
  expect(nextOccurrence({ kind: 'monthly', day: 31 }, '2024-02-29', '2024-02-29')).toBe('2024-03-31')
})

test('all recurrence kinds advance past overdue or future anchors', () => {
  expect(nextOccurrence({ kind: 'daily' }, '2024-02-01', '2024-01-01')).toBe('2024-02-02')
  expect(nextOccurrence({ kind: 'weekly', weekdays: [7] }, '2024-01-01', '2024-01-05')).toBe('2024-01-07')
  expect(nextOccurrence({ kind: 'monthly', day: 15 }, '2024-01-15', '2024-03-01')).toBe('2024-03-15')
  expect(nextOccurrence({ kind: 'monthly', day: 15 }, '2024-01-15', '2024-03-20')).toBe('2024-04-15')
})
