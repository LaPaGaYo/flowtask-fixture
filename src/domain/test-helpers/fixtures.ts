import type { Task } from '../task.js'
export function task(patch: Partial<Task> = {}): Task {
  return { id: 't1', projectId: 'p1', title: 'Task', description: '', status: 'todo', priority: 'p3', dueDate: null,
    tags: [], blockedBy: [], createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z', recurrence: null, ...patch }
}
