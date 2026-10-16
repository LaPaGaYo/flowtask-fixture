import { deleteView } from '../../services/delete-view.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'DELETE', pattern: /^\/views\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params }) => {
    return deleteView(ctx, params[0] ?? '')
  }
}
