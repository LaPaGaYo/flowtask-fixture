import { exportData } from '../../services/export-data.js'
import { ok } from '../../domain/result.js'
import type { Route } from '../types.js'
export const route: Route = {
  method: 'GET', pattern: /^\/export$/,
  handle: async ({ ctx, url }) => {
    const format = url.searchParams.get('format') ?? 'json'
    const result = await exportData(ctx, format)
    return result.ok ? ok({ format, content: result.value }) : result
  }
}
