import { updateView } from '../../services/update-view.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'PATCH', pattern: /^\/views\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params, body }) => {
    return updateView(ctx, params[0] ?? '', body)
  }
}
