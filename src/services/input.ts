import { isRecord } from '../domain/guards.js'
import { ok, fail, type Result } from '../domain/result.js'
export function inputFields(input: unknown, allowed: readonly string[]): Result<Record<string, unknown>> {
  return isRecord(input) && Object.keys(input).every(key => allowed.includes(key))
    ? ok(input) : fail('validation', `Expected object with fields: ${allowed.join(', ')}`)
}
