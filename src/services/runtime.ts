import { clockAt } from '../domain/clock.js'
import { sequentialIds } from '../domain/id-source.js'
import { ok, type Result } from '../domain/result.js'
import { JsonFileRepository } from '../storage/json-file-repository.js'
import type { Context } from './context.js'
export function createContext(path: string, now = '2000-01-01T00:00:00.000Z'): Result<Context> {
  const clock = clockAt(now)
  return clock.ok ? ok({ repository: new JsonFileRepository(path), clock: clock.value, ids: sequentialIds() }) : clock
}
