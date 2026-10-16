import { compareText } from './date.js'
import { isReady } from './dependencies.js'
import type { Task } from './task.js'
import type { TaskFilter, TaskSort } from './saved-view.js'
function compareValue(a: string | null, b: string | null): number {
  return a === null ? (b === null ? 0 : 1) : b === null ? -1 : compareText(a, b)
}
export function queryTasks(tasks: readonly Task[], filter: TaskFilter, sort: TaskSort): Task[] {
  return tasks.filter(task => (!filter.status || task.status === filter.status)
    && (!filter.projectId || task.projectId === filter.projectId) && (!filter.tag || task.tags.includes(filter.tag))
    && (filter.ready === undefined || isReady(task, tasks) === filter.ready))
    .toSorted((a, b) => compareValue(a[sort], b[sort])
      || (sort === 'priority' ? compareValue(a.dueDate, b.dueDate) : 0)
      || compareText(a.id, b.id))
}
