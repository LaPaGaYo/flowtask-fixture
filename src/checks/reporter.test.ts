import { expect, test } from 'vitest'
import type { Reporter } from 'vitest/reporters'
type TestModule = Parameters<NonNullable<Reporter['onTestRunEnd']>>[0][number]
import DeterministicReporter from '../../tests/helpers/deterministic-reporter.js'
test('verification output omits timing and sorts diagnostics', () => {
  const output: string[] = []
  const reporter = new DeterministicReporter({ write: line => output.push(line) })
  const module = {
    relativeModuleId: 'example.test.ts', errors: () => [{ message: 'collection failed' }],
    children: { allTests: () => [
      { fullName: 'B', result: () => ({ state: 'failed', errors: [{ message: 'bad B' }] }) },
      { fullName: 'A', result: () => ({ state: 'passed' }) }
    ] }
  } as unknown as TestModule
  reporter.onTestRunEnd([module], [], 'failed')
  expect(output).toEqual([
    'example.test.ts > B: bad B\n', 'example.test.ts: collection failed\n',
    'Files: 1; tests: 1 passed, 1 failed, 0 skipped, 0 pending; run: failed\n'
  ])
})
