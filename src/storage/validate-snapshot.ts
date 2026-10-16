import { hasCycle } from '../domain/dependencies.js'
import { isRecord } from '../domain/guards.js'
import { ok, fail, type Result } from '../domain/result.js'
import { parseProject, parseTag, parseActivity } from '../domain/validate-entities.js'
import { parseTask } from '../domain/validate-task.js'
import { parseView } from '../domain/validate-view.js'
import { allIds, type Snapshot } from './snapshot.js'
function collection<T>(input: unknown, parse: (value: unknown) => Result<T>): Result<T[]> {
  if (!Array.isArray(input)) return fail('validation', 'Expected entity collection')
  const values: T[] = []
  for (const item of input) {
    const result = parse(item)
    if (!result.ok) return result
    values.push(result.value)
  }
  return ok(values)
}
export function validateSnapshot(value: unknown): Result<Snapshot> {
  if (!isRecord(value) || value.version !== 1) return fail('validation', 'Expected schema version 1')
  const projects = collection(value.projects, parseProject)
  const tasks = collection(value.tasks, parseTask)
  const tags = collection(value.tags, parseTag)
  const views = collection(value.views, parseView)
  const activity = collection(value.activity, parseActivity)
  if (!projects.ok) return projects
  if (!tasks.ok) return tasks
  if (!tags.ok) return tags
  if (!views.ok) return views
  if (!activity.ok) return activity
  const state: Snapshot = { version: 1, projects: projects.value, tasks: tasks.value, tags: tags.value, views: views.value, activity: activity.value }
  const ids = allIds(state)
  if (new Set(ids).size !== ids.length) return fail('conflict', 'Entity IDs must be globally unique')
  for (const items of [state.projects, state.tags, state.views]) {
    if (new Set(items.map(item => item.name)).size !== items.length) return fail('conflict', 'Names must be unique within a collection')
  }
  for (const task of state.tasks) {
    const project = state.projects.find(candidate => candidate.id === task.projectId)
    if (!project) return fail('not_found', 'Task project does not exist')
    if (project.archived && ['todo', 'doing'].includes(task.status)) return fail('conflict', 'Archived projects cannot contain open tasks')
    if (task.tags.some(id => !state.tags.some(tag => tag.id === id))) return fail('not_found', 'Task tag does not exist')
    if (task.blockedBy.some(id => !state.tasks.some(dependency => dependency.id === id))) return fail('not_found', 'Task dependency does not exist')
    if (task.status === 'done' && task.blockedBy.some(id => !state.tasks.some(dependency => dependency.id === id && dependency.status === 'done'))) {
      return fail('blocked', 'Completed tasks must have completed dependencies')
    }
  }
  for (const view of state.views) {
    if (view.filter.projectId && !state.projects.some(project => project.id === view.filter.projectId)) return fail('not_found', 'View project does not exist')
    if (view.filter.tag && !state.tags.some(tag => tag.id === view.filter.tag)) return fail('not_found', 'View tag does not exist')
  }
  return hasCycle(state.tasks) ? fail('cycle', 'Task dependencies contain a cycle') : ok(state)
}
