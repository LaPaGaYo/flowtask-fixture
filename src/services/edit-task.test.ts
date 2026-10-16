import { expect, test } from 'vitest'
import { editTask } from './edit-task.js'
import { context, value } from './test-helpers/context.js'
import { MemoryRepository } from '../storage/memory-repository.js'
import { emptySnapshot } from '../storage/snapshot.js'
import { task } from '../domain/test-helpers/fixtures.js'

function setup(status: 'todo' | 'doing' | 'done' | 'canceled' = 'todo') {
  const state = emptySnapshot()
  state.projects.push({ id: 'p1', name: 'Work', archived: false })
  state.tasks.push(task({ status }))
  return { ...context(), repository: new MemoryRepository(state) }
}

test('editTask supplies the existing task, persists changes and uses the injected timestamp', async () => {
  const ctx = setup('doing')
  const updated = value(await editTask(ctx, 't1', 'task.updated', current => ({ title: `${current.title} edited`, dueDate: '9999-12-31' })))
  expect(updated).toEqual(task({ title: 'Task edited', status: 'doing', dueDate: '9999-12-31', updatedAt: ctx.clock.now() }))
  expect(value(await ctx.repository.read())).toMatchObject({ tasks: [updated], activity: [
    { entityId: 't1', action: 'task.updated', at: ctx.clock.now() }
  ] })
  expect(value(await editTask(ctx, 't1', 'task.updated', () => ({ dueDate: null }))).dueDate).toBe(null)
})

test.each(['done', 'canceled'] as const)('editTask rejects %s tasks before invoking the callback', async status => {
  const ctx = setup(status)
  const before = await ctx.repository.read()
  let called = false
  expect(await editTask(ctx, 't1', 'task.updated', () => { called = true; return {} }))
    .toEqual({ ok: false, error: { code: 'conflict', message: 'Closed tasks cannot be changed' } })
  expect(called).toBe(false)
  expect(await ctx.repository.read()).toEqual(before)
})

test('editTask rejects missing tasks and rolls back invalid changes', async () => {
  const ctx = setup()
  const before = await ctx.repository.read()
  expect(await editTask(ctx, 'missing', 'task.updated', () => ({})))
    .toEqual({ ok: false, error: { code: 'not_found', message: 'Task does not exist' } })
  expect(await editTask(ctx, 't1', 'task.updated', () => ({ title: '' }))).toMatchObject({ ok: false, error: { code: 'validation' } })
  expect(await editTask(ctx, 't1', 'task.updated', () => ({ projectId: 'missing' }))).toMatchObject({ ok: false, error: { code: 'not_found' } })
  expect(await ctx.repository.read()).toEqual(before)
})
