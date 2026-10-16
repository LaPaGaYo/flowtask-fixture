import type { Snapshot } from '../../storage/snapshot.js'
import type { Clock } from '../../domain/clock.js'
import { queryTasks } from '../../domain/query.js'
export function upcoming(state: Snapshot, clock: Clock) {
  const today = clock.now().slice(0, 10)
  const start = Date.parse(today)
  const end = start + 7 * 86_400_000
  return queryTasks(state.tasks, {}, 'dueDate').filter(task => ['todo', 'doing'].includes(task.status)
    && task.dueDate !== null && Date.parse(task.dueDate) >= start && Date.parse(task.dueDate) < end)
}
