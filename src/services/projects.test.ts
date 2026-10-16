import { expect, test } from 'vitest'
import { context, value } from './test-helpers/context.js'
import { createProject } from './create-project.js'
import { updateProject } from './update-project.js'
import { archiveProject } from './archive-project.js'
import { deleteProject } from './delete-project.js'
import { createTask } from './create-task.js'
import { listEntities, getEntity } from './read-entities.js'
test('project CRUD validates names and rejects archive/delete with open work', async () => {
  const ctx = context()
  const project = value(await createProject(ctx, { name: 'Work' }))
  expect((await createProject(ctx, { name: 'Work' })).ok).toBe(false)
  expect((await createProject(ctx, { name: '' })).ok).toBe(false)
  expect(value(await updateProject(ctx, project.id, { name: 'Home' })).name).toBe('Home')
  expect(value(await listEntities(ctx, 'projects'))).toHaveLength(1)
  expect(value(await getEntity(ctx, 'projects', project.id)).name).toBe('Home')
  expect((await getEntity(ctx, 'projects', 'missing')).ok).toBe(false)
  value(await createTask(ctx, { projectId: project.id, title: 'Open' }))
  expect((await archiveProject(ctx, project.id)).ok).toBe(false)
  expect((await deleteProject(ctx, project.id)).ok).toBe(false)
  const empty = value(await createProject(ctx, { name: 'Empty' }))
  expect(value(await archiveProject(ctx, empty.id)).archived).toBe(true)
  expect((await createTask(ctx, { projectId: empty.id, title: 'No' })).ok).toBe(false)
  expect((await deleteProject(ctx, empty.id)).ok).toBe(true)
})
