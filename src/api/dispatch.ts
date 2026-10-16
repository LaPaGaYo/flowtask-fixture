import { clockAt } from '../domain/clock.js'
import type { Context } from '../services/context.js'
import { routes } from './routes.js'
import { errorResponse } from './error-response.js'
import type { Response } from './types.js'
export async function dispatch(ctx: Context, method: string, target: string, body: unknown, now?: string): Promise<Response> {
  if (now !== undefined) {
    const clock = clockAt(now)
    if (!clock.ok) return errorResponse(clock.error)
    ctx = { ...ctx, clock: clock.value }
  }
  let url: URL
  try { url = new URL(target, 'http://localhost') }
  catch { return errorResponse({ code: 'validation', message: 'Invalid request URL' }) }
  const matches = routes().filter(route => route.pattern.test(url.pathname))
  const route = matches.find(candidate => candidate.method === method)
  if (!route) return matches.length > 0
    ? { status: 405, body: { error: { code: 'usage', message: 'Method not allowed' } } }
    : errorResponse({ code: 'not_found', message: 'Route does not exist' })
  let params: string[]
  try { params = (route.pattern.exec(url.pathname)?.slice(1) ?? []).map(decodeURIComponent) }
  catch { return errorResponse({ code: 'validation', message: 'Invalid URL encoding' }) }
  const result = await route.handle({ ctx, params, body, url })
  return result.ok ? { status: route.status ?? 200, body: result.value } : errorResponse(result.error)
}
