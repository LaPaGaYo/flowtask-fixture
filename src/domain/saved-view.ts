import type { TaskStatus } from './task.js'
export interface TaskFilter { projectId?: string; status?: TaskStatus; tag?: string; ready?: boolean }
export type TaskSort = 'priority' | 'dueDate' | 'createdAt' | 'title'
export interface SavedView { id: string; name: string; filter: TaskFilter; sort: TaskSort }
