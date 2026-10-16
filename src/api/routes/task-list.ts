import { listTasks } from '../../services/list-tasks.js'
import type { Route } from '../types.js'
import { taskQuery } from '../query.js'
export const route: Route = {
  method: 'GET', pattern: /^\/tasks$/, status: 200,
  handle: async ({ ctx, url }) => {
    const query = taskQuery(url)
    if (!query.ok) return query
    return listTasks(ctx, query.value.filter, query.value.sort)
  }
}
