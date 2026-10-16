import { expect, test } from 'vitest'
import { runner, output } from './test-helpers/runner.js'
test('project commands persist data and return deterministic JSON', async () => {
  const { run } = runner()
  expect((await run(['init', '--json'])).exitCode).toBe(0)
  const project = output((await run(['project', 'add', '--name', 'Work', '--json'])).stdout)
  expect((await run(['project', 'list', '--json'])).stdout).toContain('Work')
  expect((await run(['project', 'archive', String(project.id), '--json'])).stdout).toContain('"archived":true')
})
