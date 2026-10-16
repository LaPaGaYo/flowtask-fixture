import { isDate } from '../domain/date.js'
import { fail, ok, type Result } from '../domain/result.js'
import { inputFields } from './input.js'
export function dateRange(input: unknown): Result<{ from?: string; to?: string; entityId?: string }> {
  const fields = inputFields(input, ['from', 'to', 'entityId'])
  if (!fields.ok) return fields
  const { from, to, entityId } = fields.value
  if ((from !== undefined && !isDate(from)) || (to !== undefined && !isDate(to))
    || (entityId !== undefined && typeof entityId !== 'string') || (typeof from === 'string' && typeof to === 'string' && from > to)) {
    return fail('validation', 'Invalid date range')
  }
  return ok({ ...(typeof from === 'string' ? { from } : {}), ...(typeof to === 'string' ? { to } : {}),
    ...(typeof entityId === 'string' ? { entityId } : {}) })
}
