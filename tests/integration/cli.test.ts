import { afterAll, beforeAll, expect, test } from 'vitest'
import { readFile, writeFile } from 'node:fs/promises'
import { cli, executable, parse } from '../helpers/cli.js'
import { workspace } from '../helpers/workspace.js'
let work: Awaited<ReturnType<typeof workspace>>
beforeAll(async () => { work = await workspace('cli') })
afterAll(async () => { await work.cleanup() })
test('built CLI persists dependencies and recurring completion across processes', async () => {
  expect((await cli(work.data, ['init'])).code).toBe(0)
  const p = parse((await cli(work.data, ['project', 'add', '--name', 'Work'])).stdout)
  const a = parse((await cli(work.data, ['task', 'add', '--project', String(p.id), '--title', 'First'])).stdout)
  const b = parse((await cli(work.data, ['task', 'add', '--project', String(p.id), '--title', 'Repeat', '--due', '2024-01-08', '--recurrence', '{"kind":"daily"}'])).stdout)
  expect((await cli(work.data, ['task', 'block', String(b.id), String(a.id)])).code).toBe(0)
  expect((await cli(work.data, ['task', 'done', String(b.id)])).code).toBe(3)
  expect((await cli(work.data, ['task', 'done', String(a.id)])).code).toBe(0)
  const done = parse((await cli(work.data, ['task', 'done', String(b.id)])).stdout)
  expect(done).toMatchObject({ task: { status: 'done' }, nextTask: { status: 'todo', dueDate: '2024-01-09' } })
  const bytes = await readFile(work.data, 'utf8')
  expect((await cli(work.data, ['export'])).stdout).toBe(bytes)
  expect((await cli(work.data, ['project', 'archive', String(p.id)])).code).toBe(3)
})
test('built CLI returns exact exit codes and useful human output', async () => {
  expect((await cli(work.data, ['unknown'])).code).toBe(2)
  expect((await cli(work.data, ['task', 'show', 'missing'])).code).toBe(3)
  const invalid = `${work.directory}/invalid.json`
  await writeFile(invalid, '{')
  expect((await cli(invalid, ['task', 'list'])).code).toBe(4)
  const human = await executable('cli', ['project', 'list', '--data', work.data, '--now', '2024-01-08T00:00:00Z'])
  expect(human.code).toBe(0)
  expect(human.stdout).toContain('name')
  expect(human.stdout).toContain('Work')
  expect(human.stdout).not.toContain('\u001b')
})
test('built CLI import reports storage errors for missing input', async () => {
  const result = await cli(work.data, ['import', '--file', `${work.directory}/missing.csv`, '--format', 'csv'])
  expect(result.code).toBe(4)
  expect(parse(result.stderr)).toHaveProperty('error.code', 'storage')
})
