import type { Snapshot } from '../../storage/snapshot.js'
import { compareText } from '../../domain/date.js'
export function dependencyGraph(state: Snapshot): string {
  return state.tasks.toSorted((a, b) => compareText(a.id, b.id))
    .map(task => `${task.id} -> ${task.blockedBy.toSorted().join(', ') || '(none)'}`).join('\n')
}
