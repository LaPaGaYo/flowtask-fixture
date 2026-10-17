import { record, text, texts } from './manifest.js'

export function validateDecomposition(raw: unknown, goalId: string) {
  const plan = record(raw)
  if (plan.goalId !== goalId || plan.referenceOnly !== true) throw new Error('Wrong reference goal')
  if (!Array.isArray(plan.tasks) || plan.tasks.length < 8 || plan.tasks.length > 15) throw new Error('Task count')
  const tasks = plan.tasks.map((value: unknown) => {
    const task = record(value)
    const id = text(task.id)
    text(task.title); texts(task.scope)
    if (!Array.isArray(task.dependsOn)) throw new Error('Expected dependencies')
    const dependsOn = task.dependsOn.map(text)
    if (new Set(dependsOn).size !== dependsOn.length) throw new Error('Duplicate dependency')
    if (task.parallelReady !== (dependsOn.length === 0)) throw new Error('Incorrect readiness')
    if (!['S', 'M', 'L'].includes(text(task.estimatedSize))) throw new Error('Invalid size')
    if (!Array.isArray(task.acceptance) || task.acceptance.length === 0) throw new Error('Missing acceptance')
    for (const criterion of task.acceptance) {
      const acceptance = record(criterion)
      if (!text(acceptance.command).startsWith('pnpm run ')) throw new Error('Missing verification command')
      text(acceptance.must)
    }
    return { id, dependsOn }
  })
  const byId = new Map(tasks.map(task => [task.id, task]))
  if (byId.size !== tasks.length) throw new Error('Duplicate task')
  const roots = tasks.filter(task => task.dependsOn.length === 0).map(task => task.id)
  if (roots.length < 3) throw new Error('Too few roots')
  const active = new Set<string>()
  const depths = new Map<string, number>()
  function visit(id: string): number {
    const task = byId.get(id)
    if (!task) throw new Error('Unknown dependency')
    if (active.has(id)) throw new Error('Cycle')
    const cached = depths.get(id)
    if (cached !== undefined) return cached
    active.add(id)
    const depth = 1 + Math.max(0, ...task.dependsOn.map(visit))
    active.delete(id); depths.set(id, depth)
    return depth
  }
  return { count: tasks.length, roots, longestChain: Math.max(...tasks.map(task => visit(task.id))) }
}
