import type { Reporter } from 'vitest/reporters'
export default class DeterministicReporter implements Reporter {
  private readonly write: (line: string) => void
  constructor(options: { write?: (line: string) => void } = {}) {
    this.write = options.write ?? (line => { process.stdout.write(line) })
  }
  onTestRunEnd(...[modules, errors, reason]: Parameters<NonNullable<Reporter['onTestRunEnd']>>): void {
    const totals = { passed: 0, failed: 0, skipped: 0, pending: 0 }
    const diagnostics: string[] = []
    for (const module of modules) {
      for (const error of module.errors()) diagnostics.push(`${module.relativeModuleId}: ${error.message}`)
      for (const test of module.children.allTests()) {
        const result = test.result()
        totals[result.state] += 1
        for (const error of result.errors ?? []) diagnostics.push(`${module.relativeModuleId} > ${test.fullName}: ${error.message}`)
      }
    }
    for (const error of errors) diagnostics.push(`Unhandled: ${error.message}`)
    for (const diagnostic of diagnostics.toSorted()) this.write(`${diagnostic}\n`)
    this.write(`Files: ${modules.length}; tests: ${totals.passed} passed, ${totals.failed} failed, ${totals.skipped} skipped, ${totals.pending} pending; run: ${reason}\n`)
  }
}
