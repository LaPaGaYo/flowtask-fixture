import { runReport } from '../../services/run-report.js'
import { rangeQuery } from '../query.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'GET', pattern: /^\/reports\/([^/]+)$/,
  handle: ({ ctx, params, url }) => runReport(ctx, params[0] ?? '', rangeQuery(url))
}
