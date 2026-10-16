import { ok, type Result } from '../domain/result.js'
import { emptySnapshot, type Snapshot } from './snapshot.js'
import type { Repository } from './repository.js'
import { validateTransition } from './transition.js'
export class MemoryRepository implements Repository {
  private state: Snapshot
  constructor(initial: Snapshot = emptySnapshot()) { this.state = structuredClone(initial) }
  read(): Promise<Result<Snapshot>> { return Promise.resolve(ok(structuredClone(this.state))) }
  transact<T>(change: (state: Snapshot) => Result<T>): Promise<Result<T>> {
    const draft = structuredClone(this.state)
    const result = change(draft)
    if (!result.ok) return Promise.resolve(result)
    const valid = validateTransition(this.state, draft)
    if (!valid.ok) return Promise.resolve(valid)
    this.state = structuredClone(valid.value)
    return Promise.resolve(structuredClone(result))
  }
}
