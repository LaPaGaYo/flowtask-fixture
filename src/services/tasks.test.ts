import { expect, test } from 'vitest'
import { context, value } from './test-helpers/context.js'
import { createProject } from './create-project.js'
import { createTask } from './create-task.js'
import { updateTask } from './update-task.js'
import { completeTask } from './complete-task.js'
import { cancelTask } from './cancel-task.js'
import { deleteTask } from './delete-task.js'
import { listTasks } from './list-tasks.js'
test('task lifecycle prevents bypasses and creates exactly one recurring successor', async () => {
  const ctx = context()
  const p = value(await createProject(ctx, { name: 'Work' }))
  const task = value(await createTask(ctx, { projectId: p.id, title: 'Daily', dueDate: '2024-01-01', recurrence: { kind: 'daily' } }))
  expect((await updateTask(ctx, task.id, { status: 'done' })).ok).toBe(false)
  expect((await updateTask(ctx, task.id, { id: 'injected' })).ok).toBe(false)
  expect(value(await updateTask(ctx, task.id, { status: 'doing', description: 'Working' })).status).toBe('doing')
  const completed = value(await completeTask(ctx, task.id))
  expect(completed.task.status).toBe('done')
  expect(completed.nextTask?.dueDate).toBe('2024-01-09')
  expect(completed.nextTask?.status).toBe('todo')
  expect((await completeTask(ctx, task.id)).ok).toBe(false)
  expect((await cancelTask(ctx, task.id)).ok).toBe(false)
  expect(value(await listTasks(ctx))).toHaveLength(2)
  const nextId = completed.nextTask?.id ?? ''
  expect(value(await cancelTask(ctx, nextId)).status).toBe('canceled')
  expect((await updateTask(ctx, nextId, { title: 'closed' })).ok).toBe(false)
  expect((await deleteTask(ctx, nextId)).ok).toBe(true)
  expect((await deleteTask(ctx, nextId)).ok).toBe(false)
  expect((await listTasks(ctx, {}, 'bad')).ok).toBe(false)
})
test('nonrecurring completion and invalid task input are deterministic', async () => {
  const ctx = context()
  const p = value(await createProject(ctx, { name: 'Work' }))
  expect((await createTask(ctx, { projectId: p.id, title: 'Bad', dueDate: 'no' })).ok).toBe(false)
  const task = value(await createTask(ctx, { projectId: p.id, title: 'One' }))
  expect(value(await completeTask(ctx, task.id)).nextTask).toBe(null)
  expect((await completeTask(ctx, 'missing')).ok).toBe(false)
})

test('malformed enum objects return errors and recurrence overflow rolls back', async () => {
  const ctx = context()
  ctx.clock = { now: () => '9999-12-31T00:00:00.000Z' }
  const p = value(await createProject(ctx, { name: 'Work' }))
  const task = value(await createTask(ctx, { projectId: p.id, title: 'Last', recurrence: { kind: 'monthly', day: 31 } }))
  expect((await updateTask(ctx, task.id, { status: { toString: null } })).ok).toBe(false)
  expect((await completeTask(ctx, task.id)).ok).toBe(false)
  expect(value(await listTasks(ctx))[0]?.status).toBe('todo')
})
