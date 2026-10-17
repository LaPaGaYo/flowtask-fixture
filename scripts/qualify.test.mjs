import { expect, test } from 'vitest'
import { evaluateQualification, qualificationReport } from './qualify.mjs'

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
