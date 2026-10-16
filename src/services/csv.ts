import { fail, type Result } from '../domain/result.js'
import { emptySnapshot, type Snapshot } from '../storage/snapshot.js'
import { validateSnapshot } from '../storage/validate-snapshot.js'
import { parseCsvRows, quoteCsvCell } from './csv-rows.js'
export function toCsv(state: Snapshot): string {
  const rows = ['kind,payload', 'schema,1']
  for (const collection of ['projects', 'tasks', 'tags', 'views', 'activity'] as const) {
    for (const entity of state[collection]) rows.push(`${collection},${quoteCsvCell(JSON.stringify(entity))}`)
  }
  return `${rows.join('\n')}\n`
}
export function fromCsv(text: string): Result<Snapshot> {
  const parsed = parseCsvRows(text)
  if (!parsed.ok) return parsed
  if (JSON.stringify(parsed.value[0]) !== '["kind","payload"]' || JSON.stringify(parsed.value[1]) !== '["schema","1"]') {
    return fail('validation', 'Expected CSV kind,payload header and schema version 1')
  }
  const state: Record<string, unknown> = { ...emptySnapshot() }
  for (const row of parsed.value.slice(2)) {
    const [kind, payload] = row
    if (row.length !== 2 || !kind || payload === undefined || !['projects', 'tasks', 'tags', 'views', 'activity'].includes(kind)) {
      return fail('validation', 'Invalid CSV entity row')
    }
    const collection = state[kind]
    if (!Array.isArray(collection)) return fail('validation', 'Invalid CSV collection')
    try { collection.push(JSON.parse(payload) as unknown) }
    catch { return fail('validation', 'Invalid CSV JSON payload') }
  }
  return validateSnapshot(state)
}
