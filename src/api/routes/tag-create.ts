import { createTag } from '../../services/create-tag.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'POST', pattern: /^\/tags$/, status: 201,
  handle: async ({ ctx, body }) => {
    return createTag(ctx, body)
  }
}
