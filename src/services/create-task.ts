import { parseTask } from '../domain/validate-task.js'
import { createEntity } from './entity-commands.js'
import type { Context } from './context.js'
export const createTask = (ctx: Context, input: unknown) =>
  createEntity(ctx, input, ['projectId', 'title', 'description', 'priority', 'dueDate', 'tags', 'blockedBy', 'recurrence'],
    parseTask, state => state.tasks, 'task.created', {
      description: '', status: 'todo', priority: 'p3', dueDate: null, tags: [], blockedBy: [], recurrence: null,
      createdAt: ctx.clock.now(), updatedAt: ctx.clock.now()
    })
