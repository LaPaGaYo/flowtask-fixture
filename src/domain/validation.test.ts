import { expect, test } from 'vitest'
import { parseTask } from './validate-task.js'
import { parseProject, parseTag, parseActivity } from './validate-entities.js'
import { parseView, parseFilter } from './validate-view.js'
import { task } from './test-helpers/fixtures.js'
test('task validation preserves fields and rejects malformed data', () => {
  expect(parseTask(task())).toEqual({ ok: true, value: task() })
  for (const patch of [{ title: '' }, { status: 'oops' }, { priority: 'p9' }, { dueDate: '2024-02-30' }, { tags: [1] }, { updatedAt: 'yesterday' }]) {
    expect(parseTask({ ...task(), ...patch }).ok).toBe(false)
  }
  expect(parseTask(null).ok).toBe(false)
})
test('entity validation handles complete objects and typed errors', () => {
  expect(parseProject({ id: 'p', name: 'Work', archived: false }).ok).toBe(true)
  expect(parseProject({ id: 'p', name: ' ', archived: false }).ok).toBe(false)
  expect(parseTag({ id: 'tag', name: 'urgent' }).ok).toBe(true)
  expect(parseTag([]).ok).toBe(false)
  expect(parseActivity({ id: 'e', entityId: 'p', action: 'created', at: '2024-01-01T00:00:00.000Z' }).ok).toBe(true)
  expect(parseActivity({}).ok).toBe(false)
})
test('views accept only supported filters and sorts', () => {
  expect(parseView({ id: 'v', name: 'Today', filter: { status: 'todo', ready: true }, sort: 'priority' }).ok).toBe(true)
  expect(parseView({ id: 'v', name: 'Today', filter: {}, sort: 'no' }).ok).toBe(false)
  expect(parseFilter({ status: 'no' }).ok).toBe(false)
  expect(parseFilter({ ready: 'true' }).ok).toBe(false)
  expect(parseFilter({ unknown: true }).ok).toBe(false)
})

test('JSON arrays and objects cannot masquerade as enum strings', () => {
  expect(parseTask({ ...task(), status: ['todo'] }).ok).toBe(false)
  expect(parseTask({ ...task(), priority: ['p1'] }).ok).toBe(false)
  expect(parseTask({ ...task(), status: { toString: null } }).ok).toBe(false)
  expect(parseFilter({ status: ['todo'] }).ok).toBe(false)
  expect(parseView({ id: 'v', name: 'View', filter: {}, sort: ['priority'] }).ok).toBe(false)
})
