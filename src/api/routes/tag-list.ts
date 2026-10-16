import { listEntities } from '../../services/read-entities.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'GET', pattern: /^\/tags$/, status: 200,
  handle: async ({ ctx }) => {
    return listEntities(ctx, 'tags')
  }
}
