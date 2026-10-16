import { expect, test } from 'vitest'
import { dateRange } from './date-range.js'

test.each([{}, { from: '2024-02-29' }, { to: '2024-02-29', entityId: '' },
  { from: '9999-12-31', to: '9999-12-31', entityId: 't1' }])('dateRange accepts inclusive and optional boundaries: %j', input => {
  expect(dateRange(input)).toEqual({ ok: true, value: input })
})

test.each([null, [], '', { unknown: '' }, { from: '' }, { to: null }, { from: '2023-02-29' },
  { to: '10000-01-01' }, { entityId: 1 }, { from: '2024-01-02', to: '2024-01-01' }])('dateRange rejects invalid input: %j', input => {
  expect(dateRange(input)).toMatchObject({ ok: false, error: { code: 'validation' } })
})
