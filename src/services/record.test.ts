import { expect, test } from 'vitest'
import { identifier, record } from './record.js'
import { context } from './test-helpers/context.js'
import { emptySnapshot } from '../storage/snapshot.js'
import { task } from '../domain/test-helpers/fixtures.js'

test('identifier uses IDs from every collection and leaves the snapshot unchanged', () => {
  const ctx = context()
  const state = emptySnapshot()
  expect(identifier(ctx, state)).toBe('id-000001')
  state.projects.push({ id: 'id-000001', name: 'Work', archived: false })
  state.tasks.push(task({ id: 'id-000002', projectId: 'id-000001' }))
  state.tags.push({ id: 'id-000003', name: 'urgent' })
  state.views.push({ id: 'id-000004', name: 'All', filter: {}, sort: 'priority' })
  state.activity.push({ id: 'id-999999999999999999', entityId: 'id-000001', action: 'created', at: ctx.clock.now() })
  const before = structuredClone(state)
  expect(identifier(ctx, state)).toBe('id-1000000000000000000')
  expect(state).toEqual(before)
})

test('record appends distinct events with the injected clock and preserves prior events', () => {
  const ctx = context()
  const state = emptySnapshot()
  record(ctx, state, 'p1', 'project.created')
  record(ctx, state, 'p1', 'project.updated')
  expect(state.activity).toEqual([
    { id: 'id-000001', entityId: 'p1', action: 'project.created', at: '2024-01-08T12:00:00.000Z' },
    { id: 'id-000002', entityId: 'p1', action: 'project.updated', at: '2024-01-08T12:00:00.000Z' }
  ])
  expect(state.projects).toEqual([])
})
