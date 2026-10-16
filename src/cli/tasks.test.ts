import { expect, test } from 'vitest'
import { runner, output } from './test-helpers/runner.js'
test('all task commands share domain invariants', async () => {
  const { run } = runner()
  const p = output((await run(['project', 'add', '--name', 'Work', '--json'])).stdout)
  const a = output((await run(['task', 'add', '--project', String(p.id), '--title', 'A', '--json'])).stdout)
  const b = output((await run(['task', 'add', '--project', String(p.id), '--title', 'B', '--due', '2024-01-10', '--recurrence', '{"kind":"daily"}', '--json'])).stdout)
  expect((await run(['task', 'block', String(b.id), String(a.id), '--json'])).exitCode).toBe(0)
  expect((await run(['task', 'done', String(b.id), '--json'])).exitCode).toBe(3)
  expect((await run(['task', 'show', String(a.id)])).stdout).toContain('A')
  expect((await run(['task', 'update', String(a.id), '--status', 'doing', '--json'])).exitCode).toBe(0)
  expect((await run(['task', 'list', '--ready', '--sort', 'priority', '--json'])).stdout).toContain('A')
  expect((await run(['task', 'done', String(a.id), '--json'])).exitCode).toBe(0)
  expect((await run(['task', 'unblock', String(b.id), String(a.id), '--json'])).exitCode).toBe(0)
  expect((await run(['task', 'cancel', String(b.id), '--json'])).exitCode).toBe(0)
})
