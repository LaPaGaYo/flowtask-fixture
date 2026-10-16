import { ok, fail, type Result } from '../domain/result.js'
import type { Snapshot } from '../storage/snapshot.js'
import type { Context } from './context.js'
type Collection = 'projects' | 'tasks' | 'tags' | 'views'
export async function listEntities<K extends Collection>(ctx: Context, collection: K): Promise<Result<Snapshot[K]>> {
  const state = await ctx.repository.read()
  return state.ok ? ok(state.value[collection]) : state
}
export async function getEntity<K extends Collection>(ctx: Context, collection: K, id: string): Promise<Result<Snapshot[K][number]>> {
  const items = await listEntities(ctx, collection)
  if (!items.ok) return items
  const item = items.value.find(candidate => candidate.id === id)
  return item ? ok(item) : fail('not_found', 'Entity does not exist')
}
