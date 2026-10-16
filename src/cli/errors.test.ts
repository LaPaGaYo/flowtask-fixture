import { expect, test } from 'vitest'
import { runner } from './test-helpers/runner.js'
import { runCli } from './run.js'
import { fail } from '../domain/result.js'
test('usage errors are distinct from domain and storage errors', async () => {
  const { run } = runner()
  const results = await Promise.all([[], ['no'], ['task', 'show'], ['task', 'list', 'extra'], ['--unknown'], ['task', 'add', '--recurrence', '{']].map(run))
  expect(results.map(result => result.exitCode)).toEqual([2, 2, 2, 2, 2, 2])
  expect((await run(['--help'])).stdout).toContain('FlowTask')
  expect((await run(['task', 'show', 'missing', '--json'])).stderr).toContain('"error":{"code":"not_found"')
  const failed = await runCli(['init', '--json'], { context: () => fail('storage', 'Cannot read'),
    read: () => Promise.resolve(''), serve: () => Promise.resolve(fail('storage', 'failed')) })
  expect(failed.exitCode).toBe(4)
})
