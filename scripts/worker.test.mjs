import { spawnSync } from 'node:child_process'
import { mkdtempSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { expect, test } from 'vitest'
import { parseArgs, patchFor, reportFor } from '../scenarios/stub-worker/worker.mjs'

test('worker CLI validates options without coercing malformed attempts', () => {
  expect(parseArgs(['--scenario', 'retry', '--attempt', '2', '--cwd', '/tmp/work'])).toEqual({
    scenario: 'retry', attempt: 2, mode: 'succeed', cwd: '/tmp/work' })
  for (const args of [[], ['--scenario', 'other'], ['--scenario'], ['--scenario', 'retry', '--attempt', '1.0'],
    ['--scenario', 'retry', '--mode', 'crash'], ['--scenario', 'retry', '--scenario', 'retry'],
    ['--scenario', 'retry', '--extra', 'x']]) expect(() => parseArgs(args)).toThrow()
  expect(parseArgs(['--scenario', 'agent-crash', '--mode', 'hang']).mode).toBe('hang')
})
test('worker maps both attempts and produces a stable submission', () => {
  const expected = { 'deterministic-failure': ['candidate.patch', 'fix.patch'],
    'merge-only-failure': ['semantic/a.patch', 'semantic/b.patch'], retry: ['attempt-1.patch', 'attempt-2.patch'],
    'stale-completion': ['first.patch', 'stale.patch'], 'agent-crash': [null, null] }
  for (const [scenario, patches] of Object.entries(expected)) {
    expect([1, 2].map(attempt => patchFor({ scenario, attempt }))).toEqual(patches)
  }
  expect(reportFor({ scenario: 'retry', attempt: 2 }, 'attempt-2.patch', ['src/test.ts'])).toBe(
    '# Worker submission\n\ntask: retry\nattempt: 2\ncandidate: working tree after patch attempt-2.patch\n\nfiles changed:\n- src/test.ts\n\nchecks run: none — stub\n')
})

test('worker process returns usage and patch-failure codes without publishing a report', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'flowtask-worker-test-'))
  const worker = resolve('scenarios/stub-worker/worker.mjs')
  try {
    expect(spawnSync(process.execPath, [worker], { cwd, timeout: 3000 }).status).toBe(2)
    expect(spawnSync(process.execPath, [worker, '--scenario', 'retry'], { cwd, timeout: 3000 }).status).toBe(3)
    expect(existsSync(join(cwd, 'REPORT.md'))).toBe(false)
  } finally { rmSync(cwd, { recursive: true, force: true }) }
})
