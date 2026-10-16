import { createTask } from '../../services/create-task.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'POST', pattern: /^\/tasks$/, status: 201,
  handle: async ({ ctx, body }) => {
    return createTask(ctx, body)
  }
}
