import { expect, test } from 'vitest'
import { inputFields } from './input.js'

test('inputFields accepts empty and allowed fields without coercing values', () => {
  expect(inputFields({}, [])).toEqual({ ok: true, value: {} })
  const input = { title: '', dueDate: null }
  expect(inputFields(input, ['title', 'dueDate'])).toEqual({ ok: true, value: input })
})

test.each([null, undefined, [], '', 1, { other: true }])('inputFields rejects nonobjects or unknown fields: %j', input => {
  expect(inputFields(input, ['title'])).toEqual({ ok: false, error: { code: 'validation', message: 'Expected object with fields: title' } })
})
