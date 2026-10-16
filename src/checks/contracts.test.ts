import { expect, test } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
const root = resolve('src')
function sourceFiles(): string[] {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
    .map(entry => resolve(entry.parentPath, entry.name)).toSorted()
}
test('authored TypeScript modules stay small and avoid forbidden constructs', () => {
  const failures = sourceFiles().flatMap(path => {
    const text = readFileSync(path, 'utf8')
    const errors = []
    if (text.trimEnd().split('\n').length > 200) errors.push(`${relative(root, path)} exceeds 200 lines`)
    if (!path.endsWith('.test.ts') && /\bany\b|@ts-ignore|(?:eslint|oxlint)-disable|\bTODO\b/.test(text)) errors.push(`${relative(root, path)} has a forbidden construct`)
    return errors
  })
  expect(failures).toEqual([])
})
test('production imports form an acyclic graph and respect layer direction', () => {
  const files = sourceFiles().filter(path => !path.endsWith('.test.ts') && !path.includes('/test-helpers/'))
  const edges = new Map<string, string[]>()
  const violations: string[] = []
  const ranks: Record<string, number> = { domain: 0, storage: 1, services: 2, cli: 3, api: 3 }
  for (const path of files) {
    const layer = relative(root, path).split('/')[0] ?? ''
    const imports = [...readFileSync(path, 'utf8').matchAll(/from ['"]([^'"]+)['"]/g)]
      .map(match => match[1] ?? '').filter(target => target.startsWith('.'))
      .map(target => resolve(dirname(path), target.replace(/\.js$/, '.ts')))
    edges.set(path, imports)
    for (const imported of imports) {
      const other = relative(root, imported).split('/')[0] ?? ''
      if ((ranks[layer] ?? 4) < (ranks[other] ?? 4) || (['cli', 'api'].includes(layer) && ['cli', 'api'].includes(other) && layer !== other)) {
        violations.push(`${layer} imports ${other}`)
      }
    }
  }
  const active = new Set<string>()
  const visited = new Set<string>()
  function visit(path: string): void {
    if (active.has(path)) { violations.push(`Cycle at ${relative(root, path)}`); return }
    if (visited.has(path)) return
    active.add(path)
    for (const target of edges.get(path) ?? []) visit(target)
    active.delete(path)
    visited.add(path)
  }
  for (const path of files) visit(path)
  expect(violations).toEqual([])
})
