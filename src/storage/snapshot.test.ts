import { expect, test } from 'vitest'
import { emptySnapshot, allIds } from './snapshot.js'
import { validateSnapshot } from './validate-snapshot.js'
import { task } from '../domain/test-helpers/fixtures.js'
test('empty snapshots are isolated and valid', () => {
  const first = emptySnapshot()
  first.projects.push({ id: 'p1', name: 'Work', archived: false })
  expect(emptySnapshot().projects).toEqual([])
  expect(allIds(first)).toEqual(['p1'])
  expect(validateSnapshot(first).ok).toBe(true)
})
test('snapshots reject broken references, duplicate IDs, cycles and archived open work', () => {
  const state = { ...emptySnapshot(), projects: [{ id: 'p1', name: 'Work', archived: false }], tasks: [task()] }
  expect(validateSnapshot(state).ok).toBe(true)
  expect(validateSnapshot({ ...state, projects: [] }).ok).toBe(false)
  expect(validateSnapshot({ ...state, tasks: [task(), task()] }).ok).toBe(false)
  expect(validateSnapshot({ ...state, tasks: [task({ blockedBy: ['t1'] })] }).ok).toBe(false)
  expect(validateSnapshot({ ...state, projects: [{ id: 'p1', name: 'Work', archived: true }] }).ok).toBe(false)
  expect(validateSnapshot({ ...state, tasks: [task({ tags: ['missing'] })] }).ok).toBe(false)
})
