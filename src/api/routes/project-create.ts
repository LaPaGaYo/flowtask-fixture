import { createProject } from '../../services/create-project.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'POST', pattern: /^\/projects$/, status: 201,
  handle: async ({ ctx, body }) => {
    return createProject(ctx, body)
  }
}
