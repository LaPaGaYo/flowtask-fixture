import { cancelTask } from '../../services/cancel-task.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'POST', pattern: /^\/tasks\/([^/]+)\/cancel$/,
  handle: async ({ ctx, params }) => {
    return cancelTask(ctx, params[0] ?? '')
  }
}
