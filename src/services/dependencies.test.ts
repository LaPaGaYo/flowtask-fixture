import { expect, test } from 'vitest'
import { context, value } from './test-helpers/context.js'
import { createProject } from './create-project.js'
import { createTask } from './create-task.js'
import { blockTask } from './block-task.js'
import { unblockTask } from './unblock-task.js'
import { completeTask } from './complete-task.js'
import { listTasks } from './list-tasks.js'
test('blocking rejects cycles, missing targets and premature completion atomically', async () => {
  const ctx = context()
  const p = value(await createProject(ctx, { name: 'Work' }))
  const a = value(await createTask(ctx, { projectId: p.id, title: 'A' }))
  const b = value(await createTask(ctx, { projectId: p.id, title: 'B' }))
  expect(value(await blockTask(ctx, b.id, a.id)).blockedBy).toEqual([a.id])
  expect(await blockTask(ctx, a.id, b.id)).toMatchObject({ error: { code: 'cycle' } })
  expect(await blockTask(ctx, a.id, 'missing')).toMatchObject({ error: { code: 'not_found' } })
  expect(await completeTask(ctx, b.id)).toMatchObject({ error: { code: 'blocked' } })
  expect(value(await listTasks(ctx, { ready: true })).map(task => task.id)).toEqual([a.id])
  expect(value(await unblockTask(ctx, b.id, a.id)).blockedBy).toEqual([])
  value(await blockTask(ctx, b.id, a.id))
  value(await completeTask(ctx, a.id))
  expect((await completeTask(ctx, b.id)).ok).toBe(true)
})
