import { getEntity } from '../../services/read-entities.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'GET', pattern: /^\/tasks\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params }) => {
    return getEntity(ctx, 'tasks', params[0] ?? '')
  }
}
