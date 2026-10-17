import { readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { evaluateStep, patchPaths, scenarioReport } from './scenario-evaluation.mjs'
import { createScratch, observeStep, run, checkoutFingerprint } from './scenario-runtime.mjs'

async function main() {
  const root = process.cwd()
  const scenarios = []
  try {
    const manifest = JSON.parse(readFileSync(resolve(root, 'fixture-manifest.v1.json'), 'utf8'))
    const fingerprint = checkoutFingerprint(root)
    const before = run('git', ['status', '--porcelain=v1', '--untracked-files=all'], root)
    if (before.exitCode !== 0 || manifest.scenarios.length !== 5) throw new Error('Invalid checkout or scenario count')
    for (const scenario of manifest.scenarios) {
      const trees = new Map()
      const result = { id: scenario.id, steps: [] }
      scenarios.push(result)
      try {
        for (const input of scenario.inputs.filter(path => path.endsWith('.patch'))) {
          patchPaths(readFileSync(resolve(root, scenario.folder, input), 'utf8'))
        }
        for (const expected of scenario.expected) {
          if (!trees.has(expected.tree)) trees.set(expected.tree, createScratch(root))
          const observed = await observeStep(root, scenario.folder, expected, trees.get(expected.tree), manifest.checks, scenario.id)
          const failures = evaluateStep(expected, observed)
          const step = { id: expected.id, pass: failures.length === 0 }
          if (failures.length) Object.assign(step, { failures, observed })
          result.steps.push(step)
          // Never run a later dependent operation on a tree that missed its contract.
          if (failures.length) break
        }
      } catch (error) { result.steps.push({ id: 'execution', pass: false, error: error.message }) }
      finally { for (const tree of trees.values()) rmSync(tree, { recursive: true, force: true }) }
    }
    const after = run('git', ['status', '--porcelain=v1', '--untracked-files=all'], root)
    if (after.exitCode !== 0 || before.stdout !== after.stdout || fingerprint !== checkoutFingerprint(root)) throw new Error('Main checkout changed')
    const report = scenarioReport(scenarios)
    process.stdout.write(`${JSON.stringify(report)}\n`)
    process.exitCode = report.pass ? 0 : 1
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ pass: false, scenarios, error: error.message })}\n`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main()
