import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import os from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export function evaluateQualification(data) {
  const gate = (id, measured, pass) => ({ id, measured, pass })
  const successful = run => run.exitCode === 0 && run.signal === null
  return [
    gate('node', data.node, /^v22\./.test(data.node)),
    gate('pnpm', data.pnpm, data.pnpm === data.requiredPnpm),
    gate('tracked-files', data.trackedFiles, data.trackedFiles >= 150 && data.trackedFiles <= 500),
    gate('test-files', data.testFiles, data.testFiles >= 20),
    ...data.fast.map((run, index) => gate(`fast-${index + 1}`, {
      exitCode: run.exitCode, signal: run.signal, durationSeconds: run.durationSeconds,
    }, successful(run) && run.durationSeconds <= 180)),
    gate('fast-identical', { stdoutBytes: Buffer.byteLength(data.fast[0].stdout), stderrBytes: Buffer.byteLength(data.fast[0].stderr) },
      data.fast[0].stdout === data.fast[1].stdout && data.fast[0].stderr === data.fast[1].stderr),
    gate('full', { exitCode: data.full.exitCode, signal: data.full.signal, durationSeconds: data.full.durationSeconds },
      successful(data.full) && data.full.durationSeconds <= 480),
    gate('clean', data.dirtyPaths, data.dirtyPaths.length === 0),
  ]
}

export function qualificationReport(host, gates) {
  return { pass: gates.length > 0 && gates.every(gate => gate.pass), host, gates }
}

function run(command, args, timeout = 490_000) {
  const start = process.hrtime.bigint()
  const child = spawnSync(command, args, { encoding: 'utf8', timeout, maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', NO_COLOR: '1', FORCE_COLOR: '0' } })
  return { exitCode: child.status, signal: child.signal,
    durationSeconds: Number(process.hrtime.bigint() - start) / 1e9,
    stdout: child.stdout ?? '', stderr: (child.stderr ?? '') + (child.error?.message ?? '') }
}

function git(args) {
  const result = run('git', args)
  if (result.exitCode !== 0) throw new Error(result.stderr)
  return result.stdout.split('\0').filter(Boolean)
}

function main() {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    const pnpm = run('pnpm', ['--version']).stdout.trim()
    const files = git(['ls-files', '-z'])
    const fast = [run('pnpm', ['run', 'verify:fast'], 190_000), run('pnpm', ['run', 'verify:fast'], 190_000)]
    const full = run('pnpm', ['run', 'verify:full'])
    // Include staged, unstaged and untracked paths; only dist is exempt.
    const dirtyPaths = [...new Set([...git(['diff', 'HEAD', '--name-only', '-z']),
      ...git(['ls-files', '--others', '--exclude-standard', '-z'])])]
      .filter(path => !path.startsWith('dist/')).sort()
    const data = { node: process.version, pnpm, requiredPnpm: pkg.packageManager.split('@')[1].split('+')[0],
      trackedFiles: files.length, testFiles: files.filter(path => path.endsWith('.test.ts')).length, fast, full, dirtyPaths }
    const report = qualificationReport({ platform: os.platform(), arch: os.arch(), cpus: os.cpus().length,
      node: data.node, pnpm }, evaluateQualification(data))
    report.failures = [...fast, full].filter(result => result.exitCode !== 0 || result.signal)
      .map(({ stdout, stderr }) => ({ stdout, stderr }))
    process.stdout.write(`${JSON.stringify(report)}\n`)
    process.exitCode = report.pass ? 0 : 1
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ pass: false, error: error.message })}\n`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main()
