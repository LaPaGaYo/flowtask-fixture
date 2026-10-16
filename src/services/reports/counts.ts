import type { Snapshot } from '../../storage/snapshot.js'
import type { TaskStatus } from '../../domain/task.js'
export function counts(state: Snapshot): Record<TaskStatus, number> {
  const result = { todo: 0, doing: 0, done: 0, canceled: 0 }
  for (const task of state.tasks) result[task.status] += 1
  return result
}
