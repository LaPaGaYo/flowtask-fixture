import { afterEach, expect, test } from 'vitest'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { JsonFileRepository } from './json-file-repository.js'
import { ok, fail } from '../domain/result.js'
const directory = join(tmpdir(), 'flowtask-unit-storage')
afterEach(async () => { await rm(directory, { recursive: true, force: true }) })
test('atomic writes are byte-stable and failed transactions leave disk untouched', async () => {
  const path = join(directory, 'data.json')
  const repo = new JsonFileRepository(path)
  expect(await repo.read()).toMatchObject({ ok: true, value: { version: 1 } })
  expect((await repo.transact(state => { state.projects.push({ id: 'p', name: 'Work', archived: false }); return ok('p') })).ok).toBe(true)
  const before = await readFile(path, 'utf8')
  await repo.transact(() => ok(null))
  expect(await readFile(path, 'utf8')).toBe(before)
  await repo.transact(state => { state.projects.length = 0; return fail('conflict', 'rejected') })
  expect(await readFile(path, 'utf8')).toBe(before)
  expect(await readFile(`${path}.tmp`, 'utf8').catch(() => 'absent')).toBe('absent')
})
test('locks and corrupt JSON produce typed storage errors', async () => {
  await mkdir(directory, { recursive: true })
  const path = join(directory, 'data.json')
  const repo = new JsonFileRepository(path)
  await writeFile(`${path}.lock`, '')
  expect(await repo.transact(() => ok(null))).toMatchObject({ ok: false, error: { code: 'storage' } })
  await rm(`${path}.lock`)
  await writeFile(path, '{')
  expect(await repo.read()).toMatchObject({ ok: false, error: { code: 'storage' } })
  expect((await repo.transact(() => ok(null))).ok).toBe(false)
})
test('v0 persists as v1 on the next transaction', async () => {
  await mkdir(directory, { recursive: true })
  const path = join(directory, 'data.json')
  await writeFile(path, JSON.stringify({ version: 0, projects: [], tasks: [] }))
  const repo = new JsonFileRepository(path)
  expect((await repo.transact(() => ok(null))).ok).toBe(true)
  expect(JSON.parse(await readFile(path, 'utf8'))).toMatchObject({ version: 1, views: [], activity: [] })
})

test('temp-file I/O failure preserves committed bytes and releases the lock', async () => {
  const path = join(directory, 'data.json')
  const repo = new JsonFileRepository(path)
  await repo.transact(state => { state.projects.push({ id: 'p', name: 'Original', archived: false }); return ok(null) })
  const before = await readFile(path, 'utf8')
  await mkdir(`${path}.tmp`)
  expect(await repo.transact(state => {
    state.projects.push({ id: 'q', name: 'New', archived: false }); return ok(null)
  })).toMatchObject({ ok: false, error: { code: 'storage' } })
  expect(await readFile(path, 'utf8')).toBe(before)
  await rm(`${path}.tmp`, { recursive: true })
  expect((await repo.transact(() => ok(null))).ok).toBe(true)
})

test('one file repository queues concurrent transactions without lost updates', async () => {
  const repo = new JsonFileRepository(join(directory, 'data.json'))
  const results = await Promise.all(['a', 'b', 'c'].map(id => repo.transact(state => {
    state.tags.push({ id, name: id }); return ok(id)
  })))
  expect(results.every(result => result.ok)).toBe(true)
  expect(await repo.read()).toMatchObject({ value: { tags: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] } })
})
