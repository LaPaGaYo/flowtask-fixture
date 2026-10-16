import { updateProject } from '../../services/update-project.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'PATCH', pattern: /^\/projects\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params, body }) => {
    return updateProject(ctx, params[0] ?? '', body)
  }
}
