import { unblockTask } from '../../services/unblock-task.js'
import type { Route } from '../types.js'
import { isRecord, nonempty } from '../../domain/guards.js'
import { fail } from '../../domain/result.js'
export const route: Route = {
  method: 'POST', pattern: /^\/tasks\/([^/]+)\/unblock$/,
  handle: async ({ ctx, params, body }) => {
    if (!isRecord(body) || !nonempty(body.dependencyId)) return fail('validation', 'dependencyId is required')
    return unblockTask(ctx, params[0] ?? '', body.dependencyId)
  }
}
