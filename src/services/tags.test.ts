import { expect, test } from 'vitest'
import { context, value } from './test-helpers/context.js'
import { createTag } from './create-tag.js'
import { updateTag } from './update-tag.js'
import { deleteTag } from './delete-tag.js'
import { createProject } from './create-project.js'
import { createTask } from './create-task.js'
test('tag CRUD rejects duplicates and deleting a referenced tag', async () => {
  const ctx = context()
  const tag = value(await createTag(ctx, { name: 'urgent' }))
  expect((await createTag(ctx, { name: 'urgent' })).ok).toBe(false)
  expect(value(await updateTag(ctx, tag.id, { name: 'later' })).name).toBe('later')
  const p = value(await createProject(ctx, { name: 'Work' }))
  value(await createTask(ctx, { projectId: p.id, title: 'Tagged', tags: [tag.id] }))
  expect((await deleteTag(ctx, tag.id)).ok).toBe(false)
  const spare = value(await createTag(ctx, { name: 'spare' }))
  expect((await deleteTag(ctx, spare.id)).ok).toBe(true)
})
