import { MemoryRepository } from '../../storage/memory-repository.js'
import { sequentialIds } from '../../domain/id-source.js'
import type { Result } from '../../domain/result.js'
import type { Context } from '../context.js'
export function context(): Context {
  return { repository: new MemoryRepository(), clock: { now: () => '2024-01-08T12:00:00.000Z' }, ids: sequentialIds() }
}
export function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}
