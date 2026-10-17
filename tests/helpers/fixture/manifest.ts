export type RecordValue = Record<string, unknown>
export function record(value: unknown): RecordValue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Expected object')
  return value as RecordValue
}
export function text(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new Error('Expected nonempty string')
  return value
}
export function texts(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error('Expected nonempty array')
  return value.map(text)
}
function integer(value: unknown, min: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min) throw new Error('Expected integer')
  return value
}
export function parseManifest(raw: unknown) {
  const manifest = record(raw)
  if (manifest.manifestVersion !== 1) throw new Error('Unsupported manifest version')
  const fixture = record(manifest.fixture)
  for (const key of ['name', 'repository', 'license', 'baselineRef']) text(fixture[key])
  const toolchain = record(fixture.toolchain)
  for (const key of ['node', 'pnpm', 'typescript', 'vitest', 'oxlint']) text(toolchain[key])
  const checks = record(manifest.checks)
  for (const key of ['typecheck', 'lint', 'unit', 'build', 'integration', 'fast', 'full']) {
    if (!/^pnpm run [\w:-]+$/.test(text(record(checks[key]).command))) throw new Error('Invalid check command')
  }
  integer(record(checks.fast).budgetSeconds, 1); integer(record(checks.full).budgetSeconds, 1)
  const size = record(manifest.size)
  if (integer(size.trackedFilesMin, 1) > integer(size.trackedFilesMax, 1)) throw new Error('Invalid size limits')
  integer(size.testFilesMin, 1)
  const goal = record(manifest.goal)
  for (const key of ['id', 'title', 'statementFile', 'referenceDecompositionFile']) text(goal[key])
  if (!Array.isArray(manifest.scenarios) || manifest.scenarios.length !== 5) throw new Error('Expected five scenarios')
  const ids = new Set<string>()
  const scenarios = manifest.scenarios.map((entry: unknown) => {
    const scenario = record(entry)
    const id = text(scenario.id)
    if (ids.has(id)) throw new Error('Duplicate scenario')
    ids.add(id)
    const folder = text(scenario.folder)
    if (folder !== `scenarios/${id}`) throw new Error('Scenario folder mismatch')
    texts(scenario.exercises)
    const inputs = texts(scenario.inputs)
    const steps = texts(scenario.steps)
    if (!Array.isArray(scenario.expected) || scenario.expected.length !== steps.length) throw new Error('Step count mismatch')
    const stepIds = new Set<string>()
    const usedInputs = new Set<string>()
    scenario.expected.forEach((value: unknown, index: number) => {
      const expected = record(value)
      const stepId = text(expected.id)
      if (stepIds.has(stepId)) throw new Error('Duplicate step')
      stepIds.add(stepId); text(expected.tree)
      if (!steps[index]?.startsWith(`${stepId} (`)) throw new Error('Step order mismatch')
      const action = record(expected.action)
      if (!['patch', 'check', 'worker'].includes(text(action.kind))) throw new Error('Unknown action')
      if (action.kind === 'patch') {
        const input = text(action.input)
        if (!inputs.includes(input) || !input.endsWith('.patch')) throw new Error('Missing patch input')
        usedInputs.add(input)
        if (!['accepted', 'rejected'].includes(text(expected.apply))) throw new Error('Invalid apply result')
        if (action.checkOnly !== undefined && typeof action.checkOnly !== 'boolean') throw new Error('Invalid checkOnly')
      }
      if (action.kind === 'check' && !Object.hasOwn(checks, text(expected.check))) throw new Error('Unknown check')
      if (action.kind === 'worker') {
        if (!['crash', 'hang', 'succeed'].includes(text(action.mode))) throw new Error('Invalid worker mode')
        if (![1, 2].includes(integer(action.attempt, 1))) throw new Error('Invalid attempt')
        if (typeof expected.report !== 'boolean') throw new Error('Missing report assertion')
      }
      if (action.mode !== 'hang') {
        if (expected.exitCode !== null) integer(expected.exitCode, 0)
        else if (expected.signal !== 'SIGKILL') throw new Error('Missing signal')
      } else if (expected.heartbeat !== true || expected.alive !== true) throw new Error('Missing hang assertions')
      for (const key of ['failingTest', 'message', 'file', 'signal']) if (expected[key] !== undefined) text(expected[key])
      if (expected.shellExitCode !== undefined) integer(expected.shellExitCode, 0)
      for (const key of ['report', 'heartbeat', 'alive']) {
        if (expected[key] !== undefined && typeof expected[key] !== 'boolean') throw new Error('Expected boolean')
      }
    })
    for (const input of inputs.filter(path => path.endsWith('.patch'))) {
      if (!usedInputs.has(input) && !scenario.expected.some((step: unknown) => record(record(step).action).kind === 'worker')) {
        throw new Error('Unused patch')
      }
    }
    return { id, folder, inputs, steps }
  })
  return { fixture, toolchain, checks, size, goal, scenarios }
}
