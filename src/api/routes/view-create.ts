import { saveView } from '../../services/save-view.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'POST', pattern: /^\/views$/, status: 201,
  handle: async ({ ctx, body }) => {
    return saveView(ctx, body)
  }
}
