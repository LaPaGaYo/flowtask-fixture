import type { Task } from './task.js'
export function hasCycle(tasks: readonly Task[]): boolean {
  const edges = new Map(tasks.map(task => [task.id, task.blockedBy]))
  const active = new Set<string>()
  const visited = new Set<string>()
  function visit(id: string): boolean {
    if (active.has(id)) return true
    if (visited.has(id)) return false
    active.add(id)
    for (const dependency of edges.get(id) ?? []) if (visit(dependency)) return true
    active.delete(id)
    visited.add(id)
    return false
  }
  return tasks.some(task => visit(task.id))
}
export function isReady(task: Task, tasks: readonly Task[]): boolean {
  return (task.status === 'todo' || task.status === 'doing')
    && task.blockedBy.every(id => tasks.some(candidate => candidate.id === id && candidate.status === 'done'))
}
