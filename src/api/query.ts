import { ok, fail, type Result } from '../domain/result.js'
export function taskQuery(url: URL): Result<{ filter: Record<string, unknown>; sort: string }> {
  const filter: Record<string, unknown> = {}
  if ([...url.searchParams.keys()].some(key => !['projectId', 'status', 'tag', 'ready', 'sort'].includes(key))) return fail('validation', 'Unknown task query field')
  for (const key of ['projectId', 'status', 'tag']) {
    const value = url.searchParams.get(key)
    if (value !== null) filter[key] = value
  }
  const ready = url.searchParams.get('ready')
  if (ready !== null) {
    if (ready !== 'true' && ready !== 'false') return fail('validation', 'Ready must be true or false')
    filter.ready = ready === 'true'
  }
  return ok({ filter, sort: url.searchParams.get('sort') ?? 'priority' })
}
export function rangeQuery(url: URL): Record<string, string> { return Object.fromEntries(url.searchParams) }
