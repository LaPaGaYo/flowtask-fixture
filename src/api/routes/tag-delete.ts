import { deleteTag } from '../../services/delete-tag.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'DELETE', pattern: /^\/tags\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params }) => {
    return deleteTag(ctx, params[0] ?? '')
  }
}
