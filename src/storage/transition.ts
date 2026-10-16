import { fail, type Result } from '../domain/result.js'
import type { Snapshot } from './snapshot.js'
import { validateSnapshot } from './validate-snapshot.js'
export function validateTransition(before: Snapshot, after: Snapshot): Result<Snapshot> {
  if (after.activity.length < before.activity.length || before.activity.some((event, index) => JSON.stringify(event) !== JSON.stringify(after.activity[index]))) {
    return fail('conflict', 'Activity is append-only')
  }
  return validateSnapshot(after)
}
