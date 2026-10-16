import { deleteProject } from '../../services/delete-project.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'DELETE', pattern: /^\/projects\/([^/]+)$/, status: 200,
  handle: async ({ ctx, params }) => {
    return deleteProject(ctx, params[0] ?? '')
  }
}
