import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export function parseArgs(args) {
  const options = { attempt: 1, mode: 'succeed', cwd: process.cwd() }
  const allowed = new Set(['scenario', 'attempt', 'mode', 'cwd'])
  const seen = new Set()
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.slice(2)
    if (!args[i]?.startsWith('--') || !allowed.has(key) || seen.has(key) || !args[i + 1]
      || args[i + 1].startsWith('--')) throw new Error('Invalid arguments')
    seen.add(key); options[key] = args[i + 1]
  }
  if (!/^[12]$/.test(String(options.attempt))) throw new Error('Attempt must be 1 or 2')
  options.attempt = Number(options.attempt)
  const ids = ['deterministic-failure', 'merge-only-failure', 'agent-crash', 'retry', 'stale-completion']
  if (!ids.includes(options.scenario) || !['crash', 'hang', 'succeed'].includes(options.mode)
    || (options.mode !== 'succeed' && options.scenario !== 'agent-crash')) throw new Error('Invalid scenario or mode')
  return options
}

export function patchFor({ scenario, attempt }) {
  return {
    'deterministic-failure': attempt === 1 ? 'candidate.patch' : 'fix.patch',
    'merge-only-failure': attempt === 1 ? 'semantic/a.patch' : 'semantic/b.patch',
    retry: `attempt-${attempt}.patch`,
    'stale-completion': attempt === 1 ? 'first.patch' : 'stale.patch',
    'agent-crash': null,
  }[scenario]
}

export function reportFor(options, patch, files) {
  return `# Worker submission\n\ntask: ${options.scenario}\nattempt: ${options.attempt}\n`
    + `candidate: working tree after patch ${patch ?? 'none'}\n\nfiles changed:\n`
    + files.map(file => `- ${file}\n`).join('') + '\nchecks run: none — stub\n'
}

function main() {
  let options
  try { options = parseArgs(process.argv.slice(2)) } catch (error) {
    process.stderr.write(`${error.message}\n`); process.exitCode = 2; return
  }
  const cwd = resolve(options.cwd)
  if (options.mode === 'crash') {
    const partial = resolve(cwd, 'src/services/half-written.ts')
    mkdirSync(dirname(partial), { recursive: true })
    writeFileSync(partial, 'export function unfinished(\n')
    process.kill(process.pid, 'SIGKILL'); return
  }
  if (options.mode === 'hang') {
    let beat = 0
    const heartbeat = () => writeFileSync(resolve(cwd, 'scenarios-heartbeat.txt'), `heartbeat ${++beat}\n`)
    heartbeat(); setInterval(heartbeat, 1000); return
  }
  const patch = patchFor(options)
  let files = []
  if (patch) {
    const path = resolve(dirname(fileURLToPath(import.meta.url)), '..', options.scenario, patch)
    try {
      const contents = readFileSync(path, 'utf8')
      const child = spawnSync('git', ['apply', '--whitespace=nowarn', path], { cwd, encoding: 'utf8' })
      if (child.status !== 0 || child.error) throw new Error(child.stderr || child.error?.message || 'Patch failed')
      files = [...contents.matchAll(/^diff --git a\/\S+ b\/(\S+)$/gm)].map(match => match[1]).sort()
    } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 3; return }
  }
  writeFileSync(resolve(cwd, 'REPORT.md'), reportFor(options, patch, files))
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main()
