import { createHash } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { patchPaths, unitEvidence } from './scenario-evaluation.mjs'
import { reportFor, patchFor } from '../scenarios/stub-worker/worker.mjs'

const env = { ...process.env, GIT_OPTIONAL_LOCKS: '0', NO_COLOR: '1', FORCE_COLOR: '0' }
export function run(command, args, cwd, input) {
  const child = spawnSync(command, args, { cwd, input, env, encoding: 'utf8', timeout: 90_000, maxBuffer: 16 * 1024 * 1024 })
  return { exitCode: child.status, signal: child.signal, stdout: child.stdout ?? '',
    stderr: (child.stderr ?? '') + (child.error?.message ?? '') }
}

export function createScratch(root) {
  const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'flowtask-scenario-')))
  try {
    const archive = spawnSync('git', ['archive', 'HEAD'], { cwd: root, env, maxBuffer: 32 * 1024 * 1024 })
    if (archive.status !== 0) throw new Error(String(archive.stderr))
    const unpack = run('tar', ['-xf', '-', '-C', scratch], root, archive.stdout)
    if (unpack.exitCode !== 0) throw new Error(unpack.stderr)
    symlinkSync(resolve(root, 'node_modules'), join(scratch, 'node_modules'), 'dir')
    return scratch
  } catch (error) { rmSync(scratch, { recursive: true, force: true }); throw error }
}

async function observeHang(worker, args, cwd, file) {
  const child = spawn(process.execPath, [worker, ...args], { cwd, env, stdio: 'ignore' })
  const closed = new Promise((resolveClose, reject) => {
    child.once('error', reject)
    child.once('close', (exitCode, signal) => resolveClose({ exitCode, signal }))
  })
  let first = null
  let heartbeat = false
  let alive = false
  try {
    for (let poll = 0; poll < 60; poll += 1) {
      await delay(100)
      if (child.exitCode !== null || child.signalCode !== null) break
      if (existsSync(file)) {
        const current = readFileSync(file, 'utf8')
        if (first === null) first = current
        else if (/^heartbeat \d+\n$/.test(current) && current !== first) { heartbeat = true; break }
      }
    }
    alive = child.exitCode === null && child.signalCode === null
  } finally {
    child.kill('SIGKILL')
    await closed
  }
  return { heartbeat, alive, report: existsSync(join(cwd, 'REPORT.md')), stdout: '', stderr: '' }
}

export async function observeStep(root, folder, step, cwd, checks, scenario) {
  const action = step.action
  if (action.kind === 'patch') {
    const path = resolve(root, folder, action.input)
    patchPaths(readFileSync(path, 'utf8'))
    const result = run('git', ['apply', '--whitespace=nowarn', '--check', path], cwd)
    result.apply = result.exitCode === 0 ? 'accepted' : 'rejected'
    if (result.exitCode === 0 && !action.checkOnly) {
      const applied = run('git', ['apply', '--whitespace=nowarn', path], cwd)
      if (applied.exitCode !== 0) return { ...applied, apply: 'rejected' }
    }
    return result
  }
  if (action.kind === 'check') {
    const command = checks[step.check].command
    if (!/^pnpm run [\w:-]+$/.test(command)) throw new Error('Unsupported check command')
    const args = command.split(' ').slice(1)
    if (step.failingTest) args.push('--reporter=./tests/helpers/deterministic-reporter.ts',
      '--reporter=json', '--outputFile.json=scenario-unit.json')
    const observed = run('pnpm', args, cwd)
    if (step.failingTest) Object.assign(observed, unitEvidence(JSON.parse(readFileSync(join(cwd, 'scenario-unit.json'), 'utf8')), cwd))
    return observed
  }
  const worker = resolve(root, 'scenarios/stub-worker/worker.mjs')
  const args = ['--scenario', scenario, '--attempt', String(action.attempt ?? 1), '--mode', action.mode, '--cwd', cwd]
  const file = resolve(cwd, step.file ?? 'scenarios-heartbeat.txt')
  if (existsSync(join(cwd, 'REPORT.md'))) rmSync(join(cwd, 'REPORT.md'))
  if (action.mode === 'hang') return observeHang(worker, args, cwd, file)
  const before = existsSync(file) ? readFileSync(file, 'utf8') : null
  const observed = run(process.execPath, [worker, ...args], cwd)
  observed.shellExitCode = observed.signal === 'SIGKILL' ? 137 : observed.exitCode
  observed.report = existsSync(join(cwd, 'REPORT.md'))
  if (step.report === true && observed.report) {
    const options = { scenario, attempt: action.attempt ?? 1 }
    const patch = patchFor(options)
    const files = patch ? patchPaths(readFileSync(resolve(root, folder, patch), 'utf8')).sort() : []
    observed.report = readFileSync(join(cwd, 'REPORT.md'), 'utf8') === reportFor(options, patch, files)
  }
  if (step.file) {
    observed.file = step.file; observed.fileExists = existsSync(file)
    observed.dirty = observed.fileExists && readFileSync(file, 'utf8') !== before
  }
  return observed
}

export function checkoutFingerprint(root) {
  const files = run('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], root)
  if (files.exitCode !== 0) throw new Error(files.stderr)
  const hash = createHash('sha256')
  for (const file of files.stdout.split('\0').filter(Boolean).sort()) {
    if (file.startsWith('dist/')) continue
    hash.update(file).update('\0')
    const path = resolve(root, file)
    hash.update(existsSync(path) ? readFileSync(path) : '<deleted>').update('\0')
  }
  return hash.digest('hex')
}
