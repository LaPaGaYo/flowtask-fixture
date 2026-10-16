import { expect, test } from 'vitest'
import { context, value } from './test-helpers/context.js'
import { createProject } from './create-project.js'
import { createTask } from './create-task.js'
import { exportData } from './export-data.js'
import { importData } from './import-data.js'
import { listEntities } from './read-entities.js'
import { queryActivity } from './query-activity.js'
test.each(['json', 'csv'])('%s export imports atomically and preserves activity', async format => {
  const source = context()
  const project = value(await createProject(source, { name: 'A, "B"' }))
  value(await createTask(source, { projectId: project.id, title: 'Hello', description: 'one\ntwo' }))
  const text = value(await exportData(source, format))
  const target = context()
  expect((await importData(target, text, format)).ok).toBe(true)
  expect(value(await listEntities(target, 'tasks'))).toEqual(value(await listEntities(source, 'tasks')))
  expect(value(await queryActivity(target)).slice(0, -1)).toEqual(value(await queryActivity(source)))
  const before = value(await exportData(target))
  expect((await importData(target, 'invalid', format)).ok).toBe(false)
  expect(value(await exportData(target))).toBe(before)
  expect((await importData(target, text, format)).ok).toBe(true)
  expect(value(await queryActivity(target))).toHaveLength(4)
})
test('unsupported formats fail without mutations', async () => {
  const ctx = context()
  expect((await exportData(ctx, 'xml')).ok).toBe(false)
  expect((await importData(ctx, '', 'xml')).ok).toBe(false)
})
