import { context } from '../../services/test-helpers/context.js'
import { dispatch } from '../dispatch.js'
export const client = () => {
  const ctx = context()
  return (method: string, url: string, body: unknown = {}, now?: string) => dispatch(ctx, method, url, body, now)
}
export function entity(body: unknown): Record<string, unknown> { return body as Record<string, unknown> }
