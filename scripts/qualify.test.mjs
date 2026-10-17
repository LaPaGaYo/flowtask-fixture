import { expect, test } from 'vitest'
import { evaluateQualification, normalizeCheckOutput, qualificationReport } from './qualify.mjs'

const run = { exitCode: 0, signal: null, durationSeconds: 1, stdout: 'same', stderr: '' }
const evidence = () => ({ node: 'v22.23.3', pnpm: '10.34.7', requiredPnpm: '10.34.7',
  trackedFiles: 219, testFiles: 61, fast: [run, { ...run }], full: run, dirtyPaths: [] })
test('qualification accepts a clean pinned host and reports measurements', () => {
  const gates = evaluateQualification(evidence())
  expect(gates.every(gate => gate.pass)).toBe(true)
  expect(qualificationReport({ platform: 'test' }, gates)).toMatchObject({ pass: true, host: { platform: 'test' }, gates })
})
test('qualification rejects each failed gate and retains diagnostic values', () => {
  const data = evidence()
  Object.assign(data, { node: 'v20.0.0', pnpm: '9.0.0', trackedFiles: 501, testFiles: 19, dirtyPaths: ['README.md'] })
  data.fast = [{ ...run, exitCode: 1, durationSeconds: 181 }, { ...run, stdout: 'changed' }]
  data.full = { ...run, signal: 'SIGTERM', durationSeconds: 481 }
  const report = qualificationReport({}, evaluateQualification(data))
  expect(report.pass).toBe(false)
  expect(report.gates.filter(gate => gate.pass).map(gate => gate.id)).toEqual(['fast-2'])
  expect(report.gates.find(gate => gate.id === 'clean').measured).toEqual(['README.md'])
})
test('qualification compares stderr as well as stdout and accepts exact limits', () => {
  const data = evidence()
  data.fast = [{ ...run, durationSeconds: 180 }, { ...run, stderr: 'warning', durationSeconds: 180 }]
  data.full = { ...run, durationSeconds: 480 }
  data.trackedFiles = 150; data.testFiles = 20
  expect(evaluateQualification(data).filter(gate => !gate.pass).map(gate => gate.id)).toEqual(['fast-identical'])
})

test.each(['stdout', 'stderr'])('qualification ignores only timing differences in %s', stream => {
  const data = evidence()
  data.fast = ['5ms', '12.5ms'].map(duration => ({ ...run,
    [stream]: `pnpm run lint\nFinished in ${duration} on 163 files using 12 threads.\nTests: 214 passed\n` }))
  expect(evaluateQualification(data).find(gate => gate.id === 'fast-identical').pass).toBe(true)
})

test.each(['stdout', 'stderr'])('qualification diagnoses the first differing summary line in %s', stream => {
  const data = evidence()
  data.fast = ['214 passed', '213 passed, 1 failed'].map(summary => ({ ...run,
    [stream]: `pnpm run test:unit\n\nTests: ${summary}\n` }))
  expect(evaluateQualification(data).find(gate => gate.id === 'fast-identical')).toMatchObject({
    pass: false, measured: { firstDifference: {
      stream, line: 3, run1: 'Tests: 214 passed', run2: 'Tests: 213 passed, 1 failed',
    } },
  })
})

test('qualification truncates diagnostic lines without hiding later differences', () => {
  const data = evidence()
  const prefix = 'x'.repeat(200)
  data.fast = [{ ...run, stdout: `${prefix}a` }, { ...run, stdout: `${prefix}b` }]
  expect(evaluateQualification(data).find(gate => gate.id === 'fast-identical')).toMatchObject({
    pass: false, measured: { firstDifference: { stream: 'stdout', line: 1, run1: prefix, run2: prefix } },
  })
})

test('qualification distinguishes a missing line from an empty line', () => {
  const data = evidence()
  data.fast = [{ ...run, stdout: 'same' }, { ...run, stdout: 'same\n' }]
  expect(evaluateQualification(data).find(gate => gate.id === 'fast-identical')).toMatchObject({
    pass: false, measured: { firstDifference: { stream: 'stdout', line: 2, run1: null, run2: '' } },
  })
})

test('normalization keeps file and thread counts while replacing Finished in durations', () => {
  expect(normalizeCheckOutput('Finished in 5ms on 163 files using 12 threads.\n'))
    .toBe('Finished in <duration> on 163 files using 12 threads.\n')
  expect(normalizeCheckOutput('Finished in 1.25s (parse 2.5ms) on 164 files using 4 threads.\r\n'))
    .toBe('Finished in <duration> (parse <duration>) on 164 files using 4 threads.\r\n')
})

test('normalization preserves timing tokens outside lines starting with Finished in', () => {
  const text = '> pnpm run test:unit\nTests: 214 passed in 1.2s\n Finished in 5ms\nlog: Finished in 3ms\n'
  expect(normalizeCheckOutput(text)).toBe(text)
})

test.each(['164 files using 12 threads', '163 files using 4 threads'])(
  'qualification rejects changed counts: %s', counts => {
    const data = evidence()
    data.fast = ['163 files using 12 threads', counts].map(value => ({ ...run,
      stdout: `Finished in 5ms on ${value}.\n` }))
    expect(evaluateQualification(data).find(gate => gate.id === 'fast-identical').pass).toBe(false)
  },
)
