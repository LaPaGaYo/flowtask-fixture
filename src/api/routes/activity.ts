import { queryActivity } from '../../services/query-activity.js'
import { rangeQuery } from '../query.js'
import type { Route } from '../types.js'
export const route: Route = { method: 'GET', pattern: /^\/activity$/, handle: ({ ctx, url }) => queryActivity(ctx, rangeQuery(url)) }
