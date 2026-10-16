import type { Project } from '../domain/project.js'
import type { Task } from '../domain/task.js'
import type { Tag } from '../domain/tag.js'
import type { SavedView } from '../domain/saved-view.js'
import type { ActivityEvent } from '../domain/activity.js'
export interface Snapshot { version: 1; projects: Project[]; tasks: Task[]; tags: Tag[]; views: SavedView[]; activity: ActivityEvent[] }
export const emptySnapshot = (): Snapshot => ({ version: 1, projects: [], tasks: [], tags: [], views: [], activity: [] })
export const allIds = (state: Snapshot): string[] =>
  [...state.projects, ...state.tasks, ...state.tags, ...state.views, ...state.activity].map(item => item.id)
