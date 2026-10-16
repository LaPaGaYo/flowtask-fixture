import { addDays } from './date.js'
import { isRecord } from './guards.js'
import { ok, fail, type Result } from './result.js'
export type Recurrence = { kind: 'daily' } | { kind: 'weekly'; weekdays: number[] }
  | { kind: 'monthly'; day: number } | { kind: 'interval'; days: number }
export function parseRecurrence(value: unknown): Result<Recurrence | null> {
  if (value === null) return ok(null)
  if (!isRecord(value)) return fail('validation', 'Invalid recurrence')
  if (value.kind === 'daily') return ok({ kind: 'daily' })
  if (value.kind === 'weekly' && Array.isArray(value.weekdays) && value.weekdays.length > 0
    && value.weekdays.every((day: unknown) => typeof day === 'number' && Number.isInteger(day) && day >= 1 && day <= 7)) {
    return ok({ kind: 'weekly', weekdays: [...new Set(value.weekdays as number[])].toSorted((a, b) => a - b) })
  }
  if (value.kind === 'monthly' && typeof value.day === 'number' && Number.isInteger(value.day) && value.day >= 1 && value.day <= 31) {
    return ok({ kind: 'monthly', day: value.day })
  }
  if (value.kind === 'interval' && typeof value.days === 'number' && Number.isInteger(value.days) && value.days >= 1 && value.days <= 36600) {
    return ok({ kind: 'interval', days: value.days })
  }
  return fail('validation', 'Invalid recurrence')
}
export function nextOccurrence(rule: Recurrence, anchor: string, after: string): string {
  const lower = anchor > after ? anchor : after
  if (rule.kind === 'daily' || rule.kind === 'interval') {
    const step = rule.kind === 'daily' ? 1 : rule.days
    const elapsed = Math.max(0, (Date.parse(after) - Date.parse(anchor)) / 86_400_000)
    return addDays(anchor, (Math.floor(elapsed / step) + 1) * step)
  }
  if (rule.kind === 'weekly') {
    let candidate = addDays(lower, 1)
    while (!rule.weekdays.includes(new Date(candidate).getUTCDay() || 7)) candidate = addDays(candidate, 1)
    return candidate
  }
  const cursor = new Date(`${lower}T00:00:00.000Z`)
  // A monthly occurrence always advances to a later month than its anchor.
  cursor.setUTCDate(1)
  cursor.setUTCMonth(cursor.getUTCMonth() + (lower.slice(0, 7) === anchor.slice(0, 7) ? 1 : 0))
  for (;;) {
    const last = new Date(cursor)
    last.setUTCMonth(last.getUTCMonth() + 1)
    last.setUTCDate(0)
    cursor.setUTCDate(Math.min(rule.day, last.getUTCDate()))
    const candidate = cursor.toISOString().split('T')[0] ?? ''
    if (cursor.getTime() > Date.parse(lower)) return candidate
    cursor.setUTCDate(1)
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
}
