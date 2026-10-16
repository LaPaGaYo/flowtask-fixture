import { ok, fail, type Result } from '../domain/result.js'
import type { Snapshot } from '../storage/snapshot.js'
import type { Context } from './context.js'
import { inputFields } from './input.js'
import { identifier, record } from './record.js'
type Entity = { id: string }
type Select<T> = (state: Snapshot) => T[]
export function createEntity<T extends Entity>(ctx: Context, input: unknown, allowed: string[],
  parse: (input: unknown) => Result<T>, select: Select<T>, action: string, defaults: object = {}): Promise<Result<T>> {
  const fields = inputFields(input, allowed)
  if (!fields.ok) return Promise.resolve(fields)
  return ctx.repository.transact(state => {
    const parsed = parse({ ...defaults, ...fields.value, id: identifier(ctx, state) })
    if (!parsed.ok) return parsed
    select(state).push(parsed.value)
    record(ctx, state, parsed.value.id, action)
    return parsed
  })
}
export function updateEntity<T extends Entity>(ctx: Context, id: string, input: unknown, allowed: string[],
  parse: (input: unknown) => Result<T>, select: Select<T>, action: string): Promise<Result<T>> {
  const fields = inputFields(input, allowed)
  if (!fields.ok) return Promise.resolve(fields)
  return ctx.repository.transact(state => {
    const items = select(state)
    const current = items.find(item => item.id === id)
    if (!current) return fail('not_found', 'Entity does not exist')
    const parsed = parse({ ...current, ...fields.value })
    if (!parsed.ok) return parsed
    items.splice(items.indexOf(current), 1, parsed.value)
    record(ctx, state, id, action)
    return parsed
  })
}
export function deleteEntity<T extends Entity>(ctx: Context, id: string, select: Select<T>, action: string): Promise<Result<T>> {
  return ctx.repository.transact(state => {
    const items = select(state)
    const current = items.find(item => item.id === id)
    if (!current) return fail('not_found', 'Entity does not exist')
    items.splice(items.indexOf(current), 1)
    record(ctx, state, id, action)
    return ok(current)
  })
}
