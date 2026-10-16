import type { Recurrence } from './recurrence.js'
export type TaskStatus = 'todo' | 'doing' | 'done' | 'canceled'
export type Priority = 'p1' | 'p2' | 'p3' | 'p4'
export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  tags: string[]
  blockedBy: string[]
  createdAt: string
  updatedAt: string
  recurrence: Recurrence | null
}
