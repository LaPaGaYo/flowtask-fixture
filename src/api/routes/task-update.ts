import { updateTask } from '../../services/update-task.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'PATCH', pattern: /^\/tasks\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params, body }) => {
    return updateTask(ctx, params[0] ?? '', body)
  }
}
