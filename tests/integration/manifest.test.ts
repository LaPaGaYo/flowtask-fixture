import { expect, test } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, relative, isAbsolute } from 'node:path'
import { parseManifest, record, text } from '../helpers/fixture/manifest.js'
import { validateDecomposition } from '../helpers/fixture/decomposition.js'

const json = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8')) as unknown
const manifestValue = json('fixture-manifest.v1.json')
function file(path: string): void {
  const within = relative(resolve('.'), resolve(path))
  expect(isAbsolute(within) || within.startsWith('..')).toBe(false)
  expect(existsSync(path), path).toBe(true)
}
test('fixture manifest references real inputs, runbooks, checks and exact toolchain pins', () => {
  const manifest = parseManifest(manifestValue)
  const pkg = record(json('package.json'))
  expect(manifest.toolchain.node).toBe(readFileSync('.nvmrc', 'utf8').trim())
  expect(manifest.toolchain.node).toBe(record(pkg.engines).node)
  expect(manifest.toolchain.pnpm).toBe(text(pkg.packageManager).split('@')[1]?.split('+')[0])
  const lock = readFileSync('pnpm-lock.yaml', 'utf8')
  for (const name of ['typescript', 'vitest', 'oxlint']) {
    const pinned = lock.match(new RegExp(`      ${name}:\\n        specifier: ([^\\n]+)\\n        version: ([\\d.]+)`))
    expect(pinned?.[1]).toBe(record(pkg.devDependencies)[name])
    expect(manifest.toolchain[name]).toBe(pinned?.[2])
  }
  for (const check of Object.values(manifest.checks)) {
    expect(record(pkg.scripts)[text(record(check).command).slice('pnpm run '.length)]).toBeTypeOf('string')
  }
  for (const scenario of manifest.scenarios) {
    file(`${scenario.folder}/README.md`)
    for (const input of scenario.inputs) file(resolve(scenario.folder, input))
  }
  file(text(manifest.goal.statementFile)); file(text(manifest.goal.referenceDecompositionFile))
  expect(validateDecomposition(json(text(manifest.goal.referenceDecompositionFile)), text(manifest.goal.id)))
    .toEqual({ count: 12, roots: ['T01', 'T02', 'T03'], longestChain: 7 })
})
test('manifest guards reject malformed shapes, duplicate scenarios and invalid actions', () => {
  expect(() => parseManifest(null)).toThrow()
  for (const mutate of [
    (value: Record<string, unknown>) => { value.manifestVersion = 2 },
    (value: Record<string, unknown>) => { value.checks = {} },
    (value: Record<string, unknown>) => { value.goal = { id: 'x' } },
    (value: Record<string, unknown>) => {
      const scenarios = record(manifestValue).scenarios
      value.scenarios = Array(5).fill(Array.isArray(scenarios) ? scenarios[0] : null)
    },
  ]) {
    const copy = record(structuredClone(manifestValue)); mutate(copy)
    expect(() => parseManifest(copy)).toThrow()
  }
})
test('decomposition guards reject cycles, missing dependencies and incorrect readiness', () => {
  const original = json('scenarios/goal/decomposition.json')
  for (const dependency of ['T12', 'unknown']) {
    const copy = record(structuredClone(original))
    if (!Array.isArray(copy.tasks)) throw new Error('Tasks missing')
    const task = record(copy.tasks[3]); task.dependsOn = [dependency]
    expect(() => validateDecomposition(copy, 'goal-sprints-v1')).toThrow()
  }
  const copy = record(structuredClone(original))
  if (!Array.isArray(copy.tasks)) throw new Error('Tasks missing')
  record(copy.tasks[0]).parallelReady = false
  expect(() => validateDecomposition(copy, 'goal-sprints-v1')).toThrow('readiness')
})
