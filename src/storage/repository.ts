import type { Result } from '../domain/result.js'
import type { Snapshot } from './snapshot.js'
export interface Repository {
  read(): Promise<Result<Snapshot>>
  transact<T>(change: (state: Snapshot) => Result<T>): Promise<Result<T>>
}
