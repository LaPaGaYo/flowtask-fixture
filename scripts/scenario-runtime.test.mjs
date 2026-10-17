import { expect, test } from 'vitest'
import { existsSync, lstatSync, realpathSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { createScratch, checkoutFingerprint } from './scenario-runtime.mjs'
import { unitEvidence } from './scenario-evaluation.mjs'

test('archives return canonical paths matching reporter evidence and preserve checkout contents', () => {
  const root = process.cwd()
  const before = checkoutFingerprint(root)
  const tree = createScratch(root)
  try {
    expect(tree).toBe(realpathSync(tree))
    expect(existsSync(join(tree, '.git'))).toBe(false)
    expect(lstatSync(join(tree, 'node_modules')).isSymbolicLink()).toBe(true)
    const report = { numFailedTests: 1, testResults: [{ name: join(realpathSync(tree), 'src/rule.test.ts'),
      message: '', status: 'failed', assertionResults: [{ status: 'failed', fullName: 'rule' }] }] }
    expect(unitEvidence(report, tree).failingTests).toEqual(['src/rule.test.ts > rule'])
  } finally { rmSync(tree, { recursive: true, force: true }) }
  expect(checkoutFingerprint(root)).toBe(before)
})
