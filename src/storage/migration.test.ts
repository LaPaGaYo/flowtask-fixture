import { expect, test } from 'vitest'
import { migrate } from './migration.js'
import { emptySnapshot } from './snapshot.js'
import { task } from '../domain/test-helpers/fixtures.js'
test('v0 upgrades explicitly and v1 remains unchanged', () => {
  const old = { version: 0, projects: [{ id: 'p1', name: 'Work', archived: false }], tasks: [task()] }
  const result = migrate(old)
  expect(result.ok && result.value.version).toBe(1)
  expect(result.ok && result.value.views).toEqual([])
  expect(migrate(emptySnapshot())).toEqual({ ok: true, value: emptySnapshot() })
  expect(migrate({ version: 2 }).ok).toBe(false)
  expect(migrate(null).ok).toBe(false)
})
