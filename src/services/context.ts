import type { Clock } from '../domain/clock.js'
import type { IdSource } from '../domain/id-source.js'
import type { Repository } from '../storage/repository.js'
export interface Context { repository: Repository; clock: Clock; ids: IdSource }
