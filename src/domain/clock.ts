import { isTimestamp } from './date.js'
import { ok, fail, type Result } from './result.js'
export interface Clock { now(): string }
export function clockAt(instant: string): Result<Clock> {
  if (!isTimestamp(instant)) return fail('validation', 'Clock must be an ISO UTC timestamp')
  const normalized = new Date(instant).toISOString()
  return ok({ now: () => normalized })
}
