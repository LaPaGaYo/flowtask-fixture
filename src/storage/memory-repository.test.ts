import { expect, test } from 'vitest'
import { MemoryRepository } from './memory-repository.js'
import { ok, fail } from '../domain/result.js'
test('transactions isolate reads, roll back errors and serialize concurrent updates', async () => {
  const repo = new MemoryRepository()
  await repo.transact(state => { state.projects.push({ id: 'p', name: 'Work', archived: false }); return ok('created') })
  const read = await repo.read()
  if (read.ok) read.value.projects.length = 0
  expect((await repo.read())).toMatchObject({ ok: true, value: { projects: [{ id: 'p' }] } })
  await repo.transact(state => { state.projects.length = 0; return fail('conflict', 'no') })
  expect((await repo.read())).toMatchObject({ ok: true, value: { projects: [{ id: 'p' }] } })
  const results = await Promise.all(['a', 'b'].map(id => repo.transact(state => {
    state.tags.push({ id, name: id }); return ok(id)
  })))
  expect(results.every(result => result.ok)).toBe(true)
  expect(await repo.read()).toMatchObject({ value: { tags: [{ id: 'a' }, { id: 'b' }] } })
})
test('activity cannot be rewritten and invalid commits are rejected', async () => {
  const repo = new MemoryRepository()
  await repo.transact(state => { state.activity.push({ id: 'e', entityId: 'p', action: 'created', at: '2024-01-01T00:00:00Z' }); return ok(null) })
  expect((await repo.transact(state => { state.activity.length = 0; return ok(null) })).ok).toBe(false)
  expect((await repo.transact(state => { state.projects.push({ id: '', name: '', archived: false }); return ok(null) })).ok).toBe(false)
})
