import { expect, test } from 'vitest'
import { evaluateStep, scenarioReport, patchPaths, unitEvidence } from './scenario-evaluation.mjs'

const observed = { failingTests: ['src/a.test.ts > rule'], moduleErrors: 0, exitCode: 1, signal: null, stdout: 'src/a.test.ts > rule: wrong value\nFiles: 1; tests: 0 passed, 1 failed, 0 skipped, 0 pending; run: failed\n', stderr: '' }
test('expected failures require exactly the named failing test and process outcome', () => {
  const expected = { exitCode: 1, failingTest: 'src/a.test.ts > rule', message: 'wrong value' }
  expect(evaluateStep(expected, observed)).toEqual([])
  expect(evaluateStep(expected, { ...observed, exitCode: 0 })).toContain('exitCode')
  expect(evaluateStep(expected, { ...observed, stdout: observed.stdout.replace('1 failed', '2 failed') })).toContain('failingTest')
  expect(evaluateStep(expected, { ...observed, stdout: observed.stdout.replace('> rule:', '> another:') })).toContain('failingTest')
  expect(evaluateStep(expected, { ...observed, stderr: 'Unhandled: error' })).toContain('failingTest')
})
test('signals, git rejections, report absence and heartbeat are separate assertions', () => {
  expect(evaluateStep({ exitCode: null, signal: 'SIGKILL', file: 'partial', report: false },
    { exitCode: null, signal: 'SIGKILL', file: 'partial', fileExists: true, dirty: true, report: false, stdout: '', stderr: '' })).toEqual([])
  expect(evaluateStep({ apply: 'rejected', exitCode: 1, message: 'patch does not apply' },
    { ...observed, apply: 'rejected', stderr: 'patch does not apply' })).toEqual([])
  expect(evaluateStep({ heartbeat: true, alive: true }, { heartbeat: false, alive: false })).toEqual(['heartbeat', 'alive'])
  expect(evaluateStep({ report: true }, { report: false })).toEqual(['report'])
})
test('reports fail closed on missing or failed steps', () => {
  expect(scenarioReport([]).pass).toBe(false)
  expect(scenarioReport([{ id: 's', steps: [{ pass: true }] }]).pass).toBe(true)
  expect(scenarioReport([{ id: 's', steps: [] }]).pass).toBe(false)
  expect(scenarioReport([{ id: 's', steps: [{ pass: false }] }]).pass).toBe(false)
})
test('patch policy restricts ASCII, paths, size, metadata and file count', () => {
  const patch = 'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n'
  expect(patchPaths(patch)).toEqual(['src/a.ts'])
  for (const invalid of [patch.replaceAll('src/a.ts', 'package.json'), patch + '\u00e9', patch.repeat(201),
    patch.replace('--- a/src/a.ts', 'index abc..def\n--- a/src/a.ts'), patch.replaceAll('src/a.ts', 'src/../../bad'),
    patch.replace('+++ b/src/a.ts', '+++ b/package.json'), patch.replace('--- a/src/a.ts', 'new file mode 120000\n--- a/src/a.ts')]) {
    expect(() => patchPaths(invalid)).toThrow()
  }
})

test('unexpected assertion fields are never silently ignored', () => {
  expect(() => evaluateStep({ unexpectedAssertion: true }, {})).toThrow('Unknown expectation')
})

test('structured unit evidence disambiguates names and rejects extra broken modules', () => {
  const module = { name: '/repo/src/a.test.ts', message: '', status: 'failed',
    assertionResults: [{ status: 'failed', fullName: 'rule' }] }
  const evidence = unitEvidence({ numFailedTests: 1, testResults: [module] }, '/repo')
  expect(evidence).toEqual({ failingTests: ['src/a.test.ts > rule'], moduleErrors: 0 })
  const expected = { failingTest: 'src/a.test.ts > rule' }
  expect(evaluateStep(expected, { ...observed, failingTests: ['src/a.test.ts > rule: changed title'] })).toContain('failingTest')
  const broken = { ...module, name: '/repo/src/b.test.ts', message: 'Failed to load module', assertionResults: [] }
  const extra = unitEvidence({ numFailedTests: 1, testResults: [module, broken] }, '/repo')
  expect(evaluateStep(expected, { ...observed, ...extra })).toContain('failingTest')
  expect(evaluateStep(expected, { ...observed, stderr: 'src/b.test.ts: Failed to load module' })).toContain('failingTest')
  expect(() => unitEvidence({ numFailedTests: 2, testResults: [module] }, '/repo')).toThrow('Inconsistent')
  expect(() => unitEvidence({ testResults: [] }, '/repo')).toThrow('Missing')
})
