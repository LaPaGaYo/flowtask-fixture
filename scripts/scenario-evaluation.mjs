import { relative } from 'node:path'

export function patchPaths(patch) {
  if (/[^\x00-\x7f]/.test(patch) || patch.trimEnd().split('\n').length > 200
    || /^(index |From |Date:)/m.test(patch)) throw new Error('Patch encoding, size or metadata')
  const paths = [...patch.matchAll(/^diff --git a\/(\S+) b\/(\S+)$/gm)].map(match => {
    if (match[1] !== match[2] || !/^(src|tests)\/[\w./-]+$/.test(match[2])
      || match[2].split('/').includes('..')) throw new Error('Patch path')
    return match[2]
  })
  if (paths.length < 1 || paths.length > 4 || new Set(paths).size !== paths.length) throw new Error('Patch file count')
  const headers = [...patch.matchAll(/^(?:---|\+\+\+) (.+)$/gm)].map(match => match[1])
  if (headers.length !== paths.length * 2 || headers.some(path => path !== '/dev/null'
    && !paths.includes(path.replace(/^[ab]\//, '')))) throw new Error('Patch headers')
  if (/^(?:old mode|new mode|deleted file mode|rename |copy |GIT binary)/m.test(patch)
    || /^new file mode (?!100644$)/m.test(patch)) throw new Error('Patch file type')
  return paths
}

export function evaluateStep(expected, observed) {
  const known = ['id', 'tree', 'action', 'check', 'exitCode', 'shellExitCode', 'signal', 'apply',
    'report', 'heartbeat', 'alive', 'message', 'failingTest', 'file']
  if (Object.keys(expected).some(key => !known.includes(key))) throw new Error('Unknown expectation')
  const failures = []
  for (const key of ['exitCode', 'shellExitCode', 'signal', 'apply', 'report', 'heartbeat', 'alive']) {
    if (Object.hasOwn(expected, key) && expected[key] !== observed[key]) failures.push(key)
  }
  const output = `${observed.stdout ?? ''}${observed.stderr ?? ''}`
  if (expected.message && !output.includes(expected.message)) failures.push('message')
  if (expected.failingTest) {
    const diagnostics = output.split('\n').filter(line => line.includes('.test.ts > '))
    if (JSON.stringify(observed.failingTests) !== JSON.stringify([expected.failingTest])
      || observed.moduleErrors !== 0 || diagnostics.length !== 1 || !diagnostics[0].startsWith(`${expected.failingTest}: `)
      || !/tests: \d+ passed, 1 failed, 0 skipped, 0 pending; run: failed/.test(output)
      || output.includes('Unhandled:') || /^.+\.test\.[cm]?[jt]s: /m.test(output)) failures.push('failingTest')
  }
  if (expected.file && (observed.file !== expected.file || !observed.fileExists || !observed.dirty)) failures.push('file')
  return failures
}

export function scenarioReport(scenarios) {
  return { pass: scenarios.length > 0 && scenarios.every(scenario => scenario.steps.length > 0
    && scenario.steps.every(step => step.pass)), scenarios }
}

export function unitEvidence(report, cwd) {
  if (!Array.isArray(report.testResults) || report.testResults.length === 0) throw new Error('Missing unit evidence')
  const failingTests = report.testResults.flatMap(module => module.assertionResults
    .filter(test => test.status === 'failed').map(test => `${relative(cwd, module.name)} > ${test.fullName}`))
  if (report.numFailedTests !== failingTests.length) throw new Error('Inconsistent unit evidence')
  const moduleErrors = report.testResults.filter(module => module.message
    || (module.status === 'failed' && module.assertionResults.length === 0)).length
  return { failingTests, moduleErrors }
}
