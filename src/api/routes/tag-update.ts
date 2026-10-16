import { updateTag } from '../../services/update-tag.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'PATCH', pattern: /^\/tags\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params, body }) => {
    return updateTag(ctx, params[0] ?? '', body)
  }
}
