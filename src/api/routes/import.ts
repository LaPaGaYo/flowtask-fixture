import { importData } from '../../services/import-data.js'
import { isRecord } from '../../domain/guards.js'
import { fail } from '../../domain/result.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'POST', pattern: /^\/import$/,
  handle: async ({ ctx, body }) => {
    if (!isRecord(body) || typeof body.content !== 'string' || (body.format !== undefined && typeof body.format !== 'string')) {
      return fail('validation', 'Import expects content string and optional format string')
    }
    return importData(ctx, body.content, body.format ?? 'json')
  }
}
