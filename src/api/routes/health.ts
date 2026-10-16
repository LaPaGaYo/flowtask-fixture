import { ok } from '../../domain/result.js'
import type { Route } from '../types.js'
export const route: Route = { method: 'GET', pattern: /^\/health$/, handle: () => Promise.resolve(ok({ status: 'ok', version: 1 })) }
