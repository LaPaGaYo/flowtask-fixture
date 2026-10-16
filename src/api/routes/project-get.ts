import { getEntity } from '../../services/read-entities.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'GET', pattern: /^\/projects\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params }) => {
    return getEntity(ctx, 'projects', params[0] ?? '')
  }
}
