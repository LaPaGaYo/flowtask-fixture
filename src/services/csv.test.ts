import { expect, test } from 'vitest'
import { toCsv, fromCsv } from './csv.js'
import { emptySnapshot } from '../storage/snapshot.js'
import { task } from '../domain/test-helpers/fixtures.js'
test('CSV round trips quotes, commas, newlines and every entity type', () => {
  const state = { ...emptySnapshot(), projects: [{ id: 'p1', name: 'Work', archived: false }],
    tasks: [task({ title: 'Quote " and comma,', description: 'line 1\nline 2' })] }
  expect(fromCsv(toCsv(state))).toEqual({ ok: true, value: state })
  expect(fromCsv('bad').ok).toBe(false)
  expect(fromCsv('kind,payload\nschema,1\ntask,"unterminated').ok).toBe(false)
  expect(fromCsv('kind,payload\nschema,1\nother,{}\n').ok).toBe(false)
})
