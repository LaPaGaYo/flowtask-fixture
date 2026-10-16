import type { Snapshot } from '../../storage/snapshot.js'
import type { Clock } from '../../domain/clock.js'
import { queryTasks } from '../../domain/query.js'
export function overdue(state: Snapshot, clock: Clock) {
  const today = clock.now().slice(0, 10)
  return queryTasks(state.tasks, {}, 'dueDate').filter(task => ['todo', 'doing'].includes(task.status) && task.dueDate !== null && task.dueDate < today)
}
