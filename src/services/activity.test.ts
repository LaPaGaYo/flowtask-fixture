import { expect, test } from 'vitest'
import { context, value } from './test-helpers/context.js'
import { createProject } from './create-project.js'
import { queryActivity } from './query-activity.js'
import { initialize } from './initialize.js'
test('activity queries support entity and inclusive date ranges', async () => {
  const ctx = context()
  expect((await initialize(ctx)).ok).toBe(true)
  const p = value(await createProject(ctx, { name: 'Work' }))
  expect(value(await queryActivity(ctx, { entityId: p.id, from: '2024-01-08', to: '2024-01-08' }))).toHaveLength(1)
  expect(value(await queryActivity(ctx, { from: '2024-01-09' }))).toEqual([])
  expect((await queryActivity(ctx, { from: 'bad' })).ok).toBe(false)
})
