import { expect, test } from 'vitest'
import { context, value } from './test-helpers/context.js'
import { saveView } from './save-view.js'
import { updateView } from './update-view.js'
import { deleteView } from './delete-view.js'
import { runView } from './run-view.js'
import { createProject } from './create-project.js'
import { createTask } from './create-task.js'
test('saved views validate filters and execute their persisted sort', async () => {
  const ctx = context()
  const p = value(await createProject(ctx, { name: 'Work' }))
  value(await createTask(ctx, { projectId: p.id, title: 'B' }))
  value(await createTask(ctx, { projectId: p.id, title: 'A' }))
  const view = value(await saveView(ctx, { name: 'Open', filter: { status: 'todo' }, sort: 'title' }))
  expect(value(await runView(ctx, view.id)).map(task => task.title)).toEqual(['A', 'B'])
  expect(value(await updateView(ctx, view.id, { name: 'Ready', filter: { ready: true } })).name).toBe('Ready')
  expect((await saveView(ctx, { name: 'Bad', filter: { status: 'no' } })).ok).toBe(false)
  expect((await deleteView(ctx, view.id)).ok).toBe(true)
  expect((await runView(ctx, view.id)).ok).toBe(false)
})
