import { runView } from '../../services/run-view.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'GET', pattern: /^\/views\/([^/]+)\/run$/,
  handle: ({ ctx, params }) => runView(ctx, params[0] ?? '')
}
