import { listEntities } from '../../services/read-entities.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'GET', pattern: /^\/projects$/, status: 200,
  handle: async ({ ctx }) => {
    return listEntities(ctx, 'projects')
  }
}
