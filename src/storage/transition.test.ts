import { expect, test } from 'vitest'
import { validateTransition } from './transition.js'
import { emptySnapshot } from './snapshot.js'

test('validateTransition accepts empty state and appends without mutating the prior log', () => {
  const before = emptySnapshot()
  expect(validateTransition(before, emptySnapshot())).toEqual({ ok: true, value: before })
  const after = structuredClone(before)
  after.activity.push({ id: 'e1', entityId: 'p1', action: 'project.created', at: '2024-01-01T00:00:00.000Z' })
  expect(validateTransition(before, after)).toEqual({ ok: true, value: after })
  expect(before.activity).toEqual([])
  expect(validateTransition(after, structuredClone(after))).toEqual({ ok: true, value: after })
})

test('validateTransition rejects removal, edits and reordering of existing activity', () => {
  const before = emptySnapshot()
  before.activity = ['e1', 'e2'].map(id => ({ id, entityId: 'p1', action: 'project.updated', at: '2024-01-01T00:00:00.000Z' }))
  const edited = structuredClone(before)
  edited.activity[0] = { ...before.activity[0]!, action: 'project.deleted' }
  for (const after of [emptySnapshot(), edited, { ...before, activity: before.activity.toReversed() }]) {
    expect(validateTransition(before, after)).toEqual({ ok: false, error: { code: 'conflict', message: 'Activity is append-only' } })
  }
})

test('validateTransition validates appended events and entity invariants', () => {
  const before = emptySnapshot()
  expect(validateTransition(before, { ...before, projects: [{ id: 'p1', name: '', archived: false }] }))
    .toMatchObject({ ok: false, error: { code: 'validation' } })
  expect(validateTransition(before, { ...before, activity: [{ id: 'e1', entityId: 'p1', action: 'created', at: 'invalid' }] }))
    .toMatchObject({ ok: false, error: { code: 'validation' } })
})
