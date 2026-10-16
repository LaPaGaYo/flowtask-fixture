import { fail, type Result } from '../domain/result.js'
import { migrate } from './migration.js'
import type { Snapshot } from './snapshot.js'
export const encode = (state: Snapshot): string => `${JSON.stringify(state, null, 2)}\n`
export function decode(text: string): Result<Snapshot> {
  try { return migrate(JSON.parse(text) as unknown) }
  catch { return fail('validation', 'Invalid JSON') }
}
