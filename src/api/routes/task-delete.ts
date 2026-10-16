import { deleteTask } from '../../services/delete-task.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'DELETE', pattern: /^\/tasks\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params }) => {
    return deleteTask(ctx, params[0] ?? '')
  }
}
