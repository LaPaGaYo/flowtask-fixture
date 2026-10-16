import { expect, test } from 'vitest'
import { context, value } from './test-helpers/context.js'
import { createProject } from './create-project.js'
import { createTask } from './create-task.js'
import { completeTask } from './complete-task.js'
import { runReport } from './run-report.js'
import { readyTasks } from './ready-tasks.js'
test('reports use injected dates and deterministic ordering', async () => {
  const ctx = context()
  const p = value(await createProject(ctx, { name: 'Work' }))
  const old = value(await createTask(ctx, { projectId: p.id, title: 'Old', dueDate: '2024-01-07', priority: 'p1' }))
  const now = value(await createTask(ctx, { projectId: p.id, title: 'Now', dueDate: '2024-01-08' }))
  value(await createTask(ctx, { projectId: p.id, title: 'Soon', dueDate: '2024-01-14', blockedBy: [old.id] }))
  value(await createTask(ctx, { projectId: p.id, title: 'Later', dueDate: '2024-01-15' }))
  expect(value(await runReport(ctx, 'counts'))).toEqual({ todo: 4, doing: 0, done: 0, canceled: 0 })
  expect(value(await runReport(ctx, 'overdue'))).toMatchObject([{ id: old.id }])
  expect(value(await runReport(ctx, 'upcoming-7-days'))).toMatchObject([{ id: now.id }, { title: 'Soon' }])
  expect(value(await readyTasks(ctx))[0]?.id).toBe(old.id)
  value(await completeTask(ctx, now.id))
  expect(value(await runReport(ctx, 'completion-per-day', { from: '2024-01-07', to: '2024-01-09' })))
    .toEqual([{ date: '2024-01-07', count: 0 }, { date: '2024-01-08', count: 1 }, { date: '2024-01-09', count: 0 }])
  expect(value(await runReport(ctx, 'dependency-graph'))).toContain(`-> ${old.id}`)
  expect((await runReport(ctx, 'no')).ok).toBe(false)
  expect((await runReport(ctx, 'completion-per-day', { from: '2024-01-09', to: '2024-01-07' })).ok).toBe(false)
})

test('the maximum supported date has a finite inclusive report', async () => {
  expect(value(await runReport(context(), 'completion-per-day', { from: '9999-12-31', to: '9999-12-31' })))
    .toEqual([{ date: '9999-12-31', count: 0 }])
})
