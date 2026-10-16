import { completeTask } from '../../services/complete-task.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'POST', pattern: /^\/tasks\/([^/]+)\/done$/,
  handle: async ({ ctx, params }) => {
    return completeTask(ctx, params[0] ?? '')
  }
}
